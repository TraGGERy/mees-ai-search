import { db } from '@/db/db'
import { subscribedUsers, userUsage } from '@/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

const FREE_TIER_DAILY_LIMIT = 10

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ remaining: 0, isSubscriber: false }, { status: 401 })
    }

    // Check if user is a subscriber
    const subscriber = await db.query.subscribedUsers.findFirst({
      where: eq(subscribedUsers.userId, userId)
    })

    if (subscriber?.subscriptionStatus === 'active') {
      return NextResponse.json({ 
        remaining: Infinity, 
        isSubscriber: true 
      })
    }

    // Get usage for free tier user
    let usage = await db.query.userUsage.findFirst({
      where: eq(userUsage.userId, userId)
    })

    // If no usage record, user has full limit
    if (!usage) {
      return NextResponse.json({ 
        remaining: FREE_TIER_DAILY_LIMIT, 
        isSubscriber: false 
      })
    }

    // Check if we need to reset daily count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastUsageDate = new Date(usage.lastUsageDate)
    lastUsageDate.setHours(0, 0, 0, 0)

    if (lastUsageDate < today) {
      // Reset count for new day
      return NextResponse.json({ 
        remaining: FREE_TIER_DAILY_LIMIT, 
        isSubscriber: false 
      })
    }

    // Calculate remaining usage
    const remaining = FREE_TIER_DAILY_LIMIT - (usage.dailyAdvancedUsage || 0)
    
    return NextResponse.json({ 
      remaining: Math.max(0, remaining), 
      isSubscriber: false 
    })
  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
} 