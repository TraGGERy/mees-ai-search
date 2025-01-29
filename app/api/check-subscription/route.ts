import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Check for active subscription
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.clerkUserId, userId))
      .limit(1);

    return NextResponse.json({
      isSubscribed: subscription?.[0]?.subscriptionStatus === 'paid',
      tier: subscription?.[0]?.currentPlan || 'free'
    });

  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
} 