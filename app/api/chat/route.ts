import { db } from '@/db/db'
import { subscribedUsers, userUsage, promptUsage } from '@/db/schema'
import { createManualToolStreamResponse } from '@/lib/streaming/create-manual-tool-stream'
import { createToolCallingStreamResponse } from '@/lib/streaming/create-tool-calling-stream'
import { isProviderEnabled, isToolCallSupported } from '@/lib/utils/registry'
import { auth, currentUser } from '@clerk/nextjs/server'
import { eq, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { getModelBasedOnUsage, updatePromptUsage, initializePromptUsage } from '@/lib/utils/model-selection'
import { PromptUsage, SubscribedUsers, UserUsage } from "@/db/schema"

export const maxDuration = 30

const DEFAULT_MODEL = 'openai:gpt-4o-mini'
const FREE_TIER_DAILY_LIMIT = 10

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('API received body:', JSON.stringify(body));
    
    const { messages, id: chatId, promptType = 'default' } = body;
    console.log('Extracted promptType:', promptType);
    
    const referer = req.headers.get('referer')
    const isSharePage = referer?.includes('/share/')
    const { userId } = await auth()
    const user = await currentUser()
    const cookieStore = await cookies()
    const searchMode = cookieStore.get('search-mode')?.value === 'true'

    if (isSharePage) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Chat API is not available on share pages'
        }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Allow default prompt type without login
    if (promptType === 'default') {
      if (!userId) {
        // For default prompts, use gpt-4o-mini without requiring login
        const model = 'openai:gpt-4o-mini';
        console.log('Non-logged-in user using gpt-4o-mini for default prompt');
        
        if (!isProviderEnabled('openai')) {
          return new Response(
            JSON.stringify({
              error: 'Provider not enabled',
              message: 'The selected provider is not currently available'
            }),
            { 
              status: 404,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }

        try {
          // Ensure chatId is maintained for anonymous users
          const result = createManualToolStreamResponse({
            messages,
            model,
            chatId: chatId || `anon-${Date.now()}`,
            searchMode,
            promptType
          });
          return result;
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          return new Response(
            JSON.stringify({
              error: streamError instanceof Error ? streamError.message : 'Failed to stream response'
            }),
            { status: 500 }
          );
        }
      }
    } else if (!userId || !user?.emailAddresses[0]?.emailAddress) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Please login to access this feature'
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const email = user?.emailAddresses[0]?.emailAddress ?? '';
    const modelFromCookie = cookieStore.get('selected-model')?.value

    // Normalize model string to use colon, not dash
    let normalizedModelFromCookie = modelFromCookie;
    if (normalizedModelFromCookie === 'openai-gpt-4o-mini') {
      normalizedModelFromCookie = 'openai:gpt-4o-mini';
    }
    if (normalizedModelFromCookie === 'openai-gpt-4.1-mini') {
      normalizedModelFromCookie = 'openai:gpt-4.1-mini';
    }

    // Get or initialize prompt usage
    let promptUsageRecord = await db.query.promptUsage.findFirst({
      where: eq(promptUsage.userId, userId)
    });

    if (!promptUsageRecord) {
      const newPromptUsage = {
        userId,
        email,
        dailyPromptUsage: 0,
        lastPromptUsageDate: new Date(),
        maxDailyPrompts: 15
      };
      await db.insert(promptUsage).values(newPromptUsage);
      promptUsageRecord = newPromptUsage;
    }

    // Update prompt usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastUsageDate = new Date(promptUsageRecord.lastPromptUsageDate);
    lastUsageDate.setHours(0, 0, 0, 0);

    if (lastUsageDate < today) {
      promptUsageRecord.dailyPromptUsage = 0;
    }

    promptUsageRecord.dailyPromptUsage += 1;
    promptUsageRecord.lastPromptUsageDate = new Date();

    await db.update(promptUsage)
      .set(promptUsageRecord)
      .where(eq(promptUsage.userId, userId));

    // Determine which model to use based on prompt usage
    const selectedModel = getModelBasedOnUsage(promptUsageRecord);
    let model;
    if (userId) {
      // For logged-in users, always use usage-based selection
      model = selectedModel;
    } else {
      // For non-logged-in users, allow cookie override (if you want)
      model = normalizedModelFromCookie || selectedModel;
    }
    
    // Force gpt-4o-mini for non-logged-in users
    if (!userId) {
      model = 'openai:gpt-4o-mini';
      console.log('Non-logged-in user using gpt-4o-mini');
    } else {
      console.log('Logged-in user model selection:', {
        selectedModel,
        modelFromCookie,
        finalModel: model,
        promptUsage: {
          dailyPromptUsage: promptUsageRecord.dailyPromptUsage,
          lastPromptUsageDate: promptUsageRecord.lastPromptUsageDate
        }
      });
    }
    
    const provider = model.split(':')[0]

    // Log searchMode value for debugging
    console.log('Search mode value:', searchMode, 'Cookie value:', cookieStore.get('search-mode')?.value)

    // Log when Pro model is being used
    if (model.includes('claude-3-5-sonnet-latest')) {
      console.log('Pro model being used for chat request:', {
        model,
        provider,
        userId: userId || 'anonymous',
        searchMode
      })
    }

    // Allow gpt-4o-mini without login
    if (!userId && !model.includes('gpt-4o-mini')) {
      return new Response(
        JSON.stringify({
          error: 'Please login to access advanced models',
          requiresLogin: true
        }),
        { status: 401 }
      )
    }

    // Require login for all prompts except 'default' (web)
    if (!userId && promptType !== 'default') {
      return new Response(
        JSON.stringify({
          error: 'Please login to use advanced prompts',
          requiresLogin: true
        }),
        { status: 401 }
      )
    }

    // Check subscription for logged-in users using advanced models
    if (userId && !model.includes('gpt-4o-mini')) {
      const subscriber = await db.query.subscribedUsers.findFirst({
        where: eq(subscribedUsers.userId, userId)
      })
      
      // If user is subscribed, skip all usage checks and continue
      if (subscriber) {
        // Skip to streaming
        if (!isProviderEnabled(provider)) {
          return new Response(`Selected provider is not enabled ${provider}`, {
            status: 404,
            statusText: 'Not Found'
          })
        }

        const supportsToolCalling = isToolCallSupported(model)

        try {
          const result = supportsToolCalling
            ? createToolCallingStreamResponse({
                messages,
                model,
                chatId,
                searchMode,
                promptType
              })
            : createManualToolStreamResponse({
                messages,
                model,
                chatId,
                searchMode,
                promptType
              })

          return result
        } catch (streamError) {
          console.error('Streaming error:', streamError)
          return new Response(
            JSON.stringify({
              error: streamError instanceof Error ? streamError.message : 'Failed to stream response'
            }),
            { status: 500 }
          )
        }
      }
      
      // If not subscribed, check free tier usage
      let usage = await db.query.userUsage.findFirst({
        where: eq(userUsage.userId, userId),
      })

      // If no usage record exists, create one
      if (!usage) {
        const newUsage = {
          userId,
          email,
          totalPrompts: 0,
          dailyAdvancedUsage: 0,
          lastUsageDate: new Date()
        };
        await db.insert(userUsage).values(newUsage);
        usage = newUsage;
      }

      // Reset count if it's a new day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastUsageDate = new Date(usage.lastUsageDate);
      lastUsageDate.setHours(0, 0, 0, 0);

      if (lastUsageDate < today) {
        await db.update(userUsage)
          .set({
            dailyAdvancedUsage: 0,
            lastUsageDate: new Date()
          })
          .where(eq(userUsage.userId, userId));
        
        usage.dailyAdvancedUsage = 0;
      }

      const remaining = FREE_TIER_DAILY_LIMIT - usage.dailyAdvancedUsage;

      if (remaining <= 0) {
        return new Response(
          JSON.stringify({
            error: 'Daily free tier limit reached',
            needsUpgrade: true,
            showPricing: true,
            remaining: 0,
            message: `You've used all ${FREE_TIER_DAILY_LIMIT} free searches today. Please upgrade for unlimited access.`
          }),
          { status: 402 }
        );
      }

      // Increment usage count
      await db.update(userUsage)
        .set({
          dailyAdvancedUsage: sql`${userUsage.dailyAdvancedUsage} + 1`,
          lastUsageDate: new Date()
        })
        .where(eq(userUsage.userId, userId));
    }

    // Check prompt usage limit for non-default prompts (only for non-subscribed users)
    if (promptType !== 'default' && userId) {
      // First check if user is subscribed
      const subscriber = await db.query.subscribedUsers.findFirst({
        where: eq(subscribedUsers.userId, userId)
      })

      // If user is not subscribed, check prompt usage
      if (!subscriber) {
        const promptUsageRecord = await db.query.promptUsage.findFirst({
          where: eq(promptUsage.userId, userId)
        })

        if (promptUsageRecord) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const lastUsageDate = new Date(promptUsageRecord.lastPromptUsageDate)
          lastUsageDate.setHours(0, 0, 0, 0)

          // If last usage was today and limit reached
          if (lastUsageDate.getTime() === today.getTime() && 
              promptUsageRecord.dailyPromptUsage >= promptUsageRecord.maxDailyPrompts) {
            return new Response(
              JSON.stringify({
                error: 'Daily prompt limit reached',
                needsUpgrade: true,
                showPricing: true,
                remaining: 0,
                message: 'You\'ve reached your daily prompt limit. Upgrade to premium for unlimited prompts.'
              }),
              { status: 402 }
            )
          }
        }
      }
    }

    if (!isProviderEnabled(provider)) {
      return new Response(`Selected provider is not enabled ${provider}`, {
        status: 404,
        statusText: 'Not Found'
      })
    }

    const supportsToolCalling = isToolCallSupported(model)

    try {
      const result = supportsToolCalling
        ? createToolCallingStreamResponse({
            messages,
            model,
            chatId,
            searchMode,
            promptType
          })
        : createManualToolStreamResponse({
            messages,
            model,
            chatId,
            searchMode,
            promptType
          })

      return result
    } catch (streamError) {
      console.error('Streaming error:', streamError)
      return new Response(
        JSON.stringify({
          error: streamError instanceof Error ? streamError.message : 'Failed to stream response'
        }),
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API route error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { status: 500 }
    )
  }
}
