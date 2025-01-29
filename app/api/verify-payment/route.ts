import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { subscribedUsers, userSubscriptions, aiAgentSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json();
    
    console.log("Searching for email:", email); // Debug log

    // Query the subscribedUsers table
    const existingUser = await db
      .select()
      .from(subscribedUsers)
      .where(eq(subscribedUsers.email, email))
      .limit(1);

    console.log("Database query result:", existingUser); // Debug log

    if (existingUser.length === 0) {
      console.log("No user found with email:", email); // Debug log
      return NextResponse.json(
        { error: "No matching email found in subscribedUsers table" },
        { status: 404 }
      );
    }

    const userData = existingUser[0];

    try {
      // Check if this is an AI agent subscription
      if (userData.currentPlan?.includes('AI_Agent')) {
        // Insert into aiAgentSubscriptions
        await db.insert(aiAgentSubscriptions).values({
          userId: userId,
          personaId: 'default',
          isSubscribed: true,
          subscriptionTier: userData.currentPlan === 'AI_Agent_Premium' ? 'pro' : 'standard',
          dailyMessageLimit: userData.currentPlan === 'AI_Agent_Premium' ? 50 : 25,
          messagesUsedToday: 0,
          lastResetDate: new Date(),
        });
        console.log("Saved AI agent subscription");
      } else {
        // Insert into regular userSubscriptions
        await db.insert(userSubscriptions).values({
          clerkUserId: userId,
          stripeUserId: userData.userId,
          email: email,
          type: userData.type || "payment_success",
          subscriptionStatus: userData.subscriptionStatus,
          currentPlan: userData.currentPlan,
          nextInvoiceDate: userData.nextInvoiceDate,
          invoicePdfUrl: userData.InvoicePdfUrl,
        });
        console.log("Saved regular subscription");
      }
    } catch (insertError) {
      console.error("Error inserting subscription:", insertError);
      return NextResponse.json(
        { error: "Failed to create subscription record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in verify-payment API:", error);
    return NextResponse.json(
      { 
        error: "Failed to process payment verification",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 