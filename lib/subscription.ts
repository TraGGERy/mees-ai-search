import { db } from "@/db/db";
import { subscribedUsers, userUsage } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const FREE_TIER_DAILY_LIMIT = 5;

export async function checkUserAccess(userId: string, email: string) {
  // First check if user has active subscription or is in trial
  const subscription = await db.query.subscribedUsers.findFirst({
    where: eq(subscribedUsers.email, email),
  });

  // Check if user has an active subscription or is in trial period
  if (subscription?.subscriptionStatus === 'active' || subscription?.subscriptionStatus === 'trialing') {
    // If in trial, check if trial has ended
    if (subscription.subscriptionStatus === 'trialing' && subscription.nextInvoiceDate) {
      const trialEnd = new Date(subscription.nextInvoiceDate);
      const now = new Date();
      
      if (now > trialEnd) {
        // Trial has ended, update status to inactive
        await db.update(subscribedUsers)
          .set({
            subscriptionStatus: 'inactive',
          })
          .where(eq(subscribedUsers.email, email));
        
        // Continue with free tier check
      } else {
        // Still in trial period
        return { 
          hasAccess: true, 
          remaining: Infinity,
          isTrialing: true,
          trialEnd: trialEnd
        };
      }
    } else {
      // Active subscription
      return { 
        hasAccess: true, 
        remaining: Infinity,
        isSubscriber: true
      };
    }
  }

  // If no subscription or trial, check daily usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let usage = await db.query.userUsage.findFirst({
    where: eq(userUsage.userId, userId),
  }) ?? {
    userId,
    email,
    dailyAdvancedUsage: 0,
    lastUsageDate: new Date(),
  };

  // Reset count if it's a new day
  const lastUsageDate = new Date(usage.lastUsageDate);
  lastUsageDate.setHours(0, 0, 0, 0);

  if (lastUsageDate < today) {
    await db.update(userUsage)
      .set({
        dailyAdvancedUsage: 0,
        lastUsageDate: new Date(),
      })
      .where(eq(userUsage.userId, userId));
    
    return { hasAccess: true, remaining: FREE_TIER_DAILY_LIMIT };
  }

  const remaining = FREE_TIER_DAILY_LIMIT - (usage.dailyAdvancedUsage || 0);
  return { 
    hasAccess: remaining > 0,
    remaining,
    needsUpgrade: remaining <= 0,
    isFreeTier: true
  };
}

export async function incrementUserUsage(userId: string) {
  await db.update(userUsage)
    .set({
      dailyAdvancedUsage: sql`${userUsage.dailyAdvancedUsage} + 1`,
      lastUsageDate: new Date(),
    })
    .where(eq(userUsage.userId, userId));
} 