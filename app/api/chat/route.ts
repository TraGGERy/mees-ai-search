import { db } from '@/db/db'
import { subscribedUsers, userUsage } from '@/db/schema'
import { createManualToolStreamResponse } from '@/lib/streaming/create-manual-tool-stream'
import { createToolCallingStreamResponse } from '@/lib/streaming/create-tool-calling-stream'
import { isProviderEnabled, isToolCallSupported } from '@/lib/utils/registry'
import { auth, currentUser } from '@clerk/nextjs/server'
import { eq, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'

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

    if (isSharePage) {
      return new Response('Chat API is not available on share pages', {
        status: 403,
        statusText: 'Forbidden'
      })
    }

    const cookieStore = await cookies()
    const modelFromCookie = cookieStore.get('selected-model')?.value
    const searchMode = cookieStore.get('search-mode')?.value === 'true'
    const model = modelFromCookie || DEFAULT_MODEL
    const provider = model.split(':')[0]

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

    // Check subscription for logged-in users using advanced models
    if (userId && !model.includes('gpt-4o-mini')) {
      const subscriber = await db.query.subscribedUsers.findFirst({
        where: eq(subscribedUsers.userId, userId)
      })
      
      if (!subscriber) {
        // Check free tier usage
        let usage = await db.query.userUsage.findFirst({
          where: eq(userUsage.userId, userId),
        })

        // If no usage record exists, create one
        if (!usage) {
          const email = user?.emailAddresses[0]?.emailAddress ?? '';
          // First create the usage record
          await db.insert(userUsage).values({
            userId,
            email,
            dailyAdvancedUsage: 0,
            lastUsageDate: new Date(),
          })
          // Then set the usage object for the rest of the function
          usage = {
            userId,
            email,
            dailyAdvancedUsage: 0,
            lastUsageDate: new Date(),
          }
        }

        // Reset count if it's a new day
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const lastUsageDate = new Date(usage.lastUsageDate)
        lastUsageDate.setHours(0, 0, 0, 0)

        if (lastUsageDate < today) {
          await db.update(userUsage)
            .set({
              dailyAdvancedUsage: 0,
              lastUsageDate: new Date(),
            })
            .where(eq(userUsage.userId, userId))
          
          usage.dailyAdvancedUsage = 0
        }

        const remaining = FREE_TIER_DAILY_LIMIT - (usage.dailyAdvancedUsage || 0)

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
          )
        }

        // Increment usage count
        await db.update(userUsage)
          .set({
            dailyAdvancedUsage: sql`${userUsage.dailyAdvancedUsage} + 1`,
            lastUsageDate: new Date(),
          })
          .where(eq(userUsage.userId, userId))
      }
    }

    if (!isProviderEnabled(provider)) {
      return new Response(`Selected provider is not enabled ${provider}`, {
        status: 404,
        statusText: 'Not Found'
      })
    }

    const supportsToolCalling = isToolCallSupported(model)

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

    return result;
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
