import { db } from '@/db/db';
import { aiAgentSubscriptions, personaUsage, defaultPersonaLimits } from '@/db/schema';
import { and, eq, gt } from 'drizzle-orm';

export async function checkPersonaAccess(userId: string, personaId: string) {
  // Check if persona is premium
  const isPremiumPersona = defaultPersonaLimits.premium.personas.includes(personaId as any);

  // Get user's subscription status
  const subscription = await db.query.aiAgentSubscriptions.findFirst({
    where: and(
      eq(aiAgentSubscriptions.userId, userId),
      eq(aiAgentSubscriptions.personaId, personaId)
    )
  });

  // If no subscription exists, create one with default free trial limits
  if (!subscription) {
    const dailyLimit = isPremiumPersona 
      ? defaultPersonaLimits.premium.dailyMessageLimit  // 10 free messages for premium
      : defaultPersonaLimits.free.dailyMessageLimit;    // 50 messages for free personas

    await db.insert(aiAgentSubscriptions).values({
      userId,
      personaId,
      subscriptionTier: 'free',
      dailyMessageLimit: dailyLimit,
      messagesUsedToday: 0,
      isSubscribed: false,
      lastResetDate: new Date()
    });

    return {
      canAccess: true,
      remainingMessages: dailyLimit,
      requiresSubscription: false, // Allow trial access
      isFreeTrial: true
    };
  }

  // Check if it's time to reset daily message count
  const lastReset = subscription.lastResetDate;
  const now = new Date();
  const isNewDay = lastReset && now.getDate() !== lastReset.getDate();

  if (isNewDay) {
    // Reset daily message count
    await db.update(aiAgentSubscriptions)
      .set({ 
        messagesUsedToday: 0,
        lastResetDate: now
      })
      .where(eq(aiAgentSubscriptions.id, subscription.id));
    
    subscription.messagesUsedToday = 0;
  }

  const hasRemainingMessages = (subscription.messagesUsedToday ?? 0) < subscription.dailyMessageLimit;
  const isSubscribed = subscription.isSubscribed;

  return {
    canAccess: isSubscribed || hasRemainingMessages,
    remainingMessages: subscription.dailyMessageLimit - (subscription.messagesUsedToday ?? 0),
    requiresSubscription: isPremiumPersona && !isSubscribed && !hasRemainingMessages,
    isFreeTrial: !isSubscribed && hasRemainingMessages
  };
} 