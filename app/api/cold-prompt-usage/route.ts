import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db/db'
import { promptUsage } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { subscribedUsers } from '@/db/schema'

export async function POST(req: Request) {
  try {
    const { userId, email, promptType } = await req.json()
    
    console.log('Received request:', { userId, email, promptType })
    
    // If no userId or email, return error
    if (!userId || !email) {
      console.log('Missing required fields:', { userId, email })
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // If promptType is 'default' (web), don't track usage
    if (promptType === 'default') {
      console.log('Web prompt selected, skipping tracking')
      return NextResponse.json({ success: true, message: 'Web prompt usage not tracked' })
    }

    // Check if user is subscribed
    const subscriber = await db.query.subscribedUsers.findFirst({
      where: eq(subscribedUsers.userId, userId)
    })

    // If user is subscribed, skip tracking
    if (subscriber) {
      console.log('Subscribed user, skipping usage tracking')
      return NextResponse.json({ 
        success: true, 
        message: 'Subscribed user - usage not tracked',
        isSubscribed: true
      })
    }

    // Get current date in user's timezone
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log('Checking existing user record...')
    // Check if user exists in promptUsage table
    const existingUser = await db
      .select()
      .from(promptUsage)
      .where(eq(promptUsage.userId, userId))
      .limit(1)

    console.log('Existing user record:', existingUser)

    if (existingUser.length === 0) {
      console.log('Creating new user record...')
      // Create new user record
      const newUser = await db.insert(promptUsage).values({
        userId,
        email,
        dailyPromptUsage: 1,
        lastPromptUsageDate: new Date(),
        maxDailyPrompts: 15
      }).returning()

      console.log('New user record created:', newUser)
    } else {
      const user = existingUser[0]
      const lastUsageDate = new Date(user.lastPromptUsageDate)
      lastUsageDate.setHours(0, 0, 0, 0)

      console.log('Processing existing user:', {
        currentUsage: user.dailyPromptUsage,
        lastUsageDate: lastUsageDate,
        today: today
      })

      // If last usage was today, increment counter
      if (lastUsageDate.getTime() === today.getTime()) {
        // Check if user has reached daily limit
        if (user.dailyPromptUsage >= user.maxDailyPrompts) {
          console.log('Daily limit reached')
          return NextResponse.json(
            { error: 'Daily prompt limit reached', remaining: 0 },
            { status: 403 }
          )
        }

        console.log('Incrementing usage counter...')
        // Increment usage counter
        const updatedUser = await db
          .update(promptUsage)
          .set({
            dailyPromptUsage: user.dailyPromptUsage + 1,
            lastPromptUsageDate: new Date()
          })
          .where(eq(promptUsage.userId, userId))
          .returning()

        console.log('Updated user record:', updatedUser)
      } else {
        console.log('Resetting counter for new day...')
        // Reset counter for new day
        const resetUser = await db
          .update(promptUsage)
          .set({
            dailyPromptUsage: 1,
            lastPromptUsageDate: new Date()
          })
          .where(eq(promptUsage.userId, userId))
          .returning()

        console.log('Reset user record:', resetUser)
      }
    }

    // Get updated usage count
    console.log('Fetching final usage count...')
    const updatedUser = await db
      .select()
      .from(promptUsage)
      .where(eq(promptUsage.userId, userId))
      .limit(1)

    console.log('Final user record:', updatedUser)

    const remaining = updatedUser[0] 
      ? updatedUser[0].maxDailyPrompts - updatedUser[0].dailyPromptUsage 
      : 14 // 15 - 1 (first usage)

    return NextResponse.json({ 
      success: true, 
      remaining,
      message: 'Prompt usage tracked successfully' 
    })
  } catch (error) {
    console.error('Error tracking prompt usage:', error)
    return NextResponse.json(
      { 
        error: 'Failed to track prompt usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check current usage
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is subscribed
    const subscriber = await db.query.subscribedUsers.findFirst({
      where: eq(subscribedUsers.userId, userId)
    })

    // If user is subscribed, return unlimited usage
    if (subscriber) {
      return NextResponse.json({ 
        remaining: 999999,
        dailyUsage: 0,
        isSubscribed: true
      })
    }

    console.log('Checking usage for user:', userId)
    const user = await db
      .select()
      .from(promptUsage)
      .where(eq(promptUsage.userId, userId))
      .limit(1)

    console.log('User usage record:', user)

    if (user.length === 0) {
      return NextResponse.json({ 
        remaining: 15,
        dailyUsage: 0
      })
    }

    const remaining = user[0].maxDailyPrompts - user[0].dailyPromptUsage

    return NextResponse.json({ 
      remaining,
      dailyUsage: user[0].dailyPromptUsage
    })
  } catch (error) {
    console.error('Error checking prompt usage:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check prompt usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 