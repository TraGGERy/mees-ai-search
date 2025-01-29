import Stripe from "stripe";
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { subscribedUsers, subscriptionEvents } from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("Stripe-Signature");

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("Webhook Event Received:", {
      type: event.type,
      id: event.id,
    });

    // Only handle 'invoice.payment_succeeded' event
    if (event.type !== "invoice.payment_succeeded") {
      console.log("Skipping non-invoice event:", event.type);
      return NextResponse.json({
        status: "Ignored",
        message: "Only handling invoice.payment_succeeded events.",
      });
    }

    const invoice = event.data.object as Stripe.Invoice;
    
    // Log the important data we're about to save
    console.log("Processing invoice data:", {
      customerId: invoice.customer,
      email: invoice.customer_email,
      status: invoice.status,
      amountPaid: invoice.amount_paid,
    });

    // First, try to save the event
    try {
      await db.insert(subscriptionEvents).values({
        eventId: event.id,
        eventPayload: event,
        email: invoice.customer_email || "",
      });
      console.log("Successfully saved event to subscriptionEvents");
    } catch (dbError) {
      console.error("Failed to save to subscriptionEvents:", dbError);
      throw dbError;
    }

    // Then, handle the user subscription
    try {
      const amount = invoice.amount_paid / 100; // Convert to dollars
      
      // For all subscriptions, we'll use subscribedUsers table
      const existingUser = await db
        .select()
        .from(subscribedUsers)
        .where(eq(subscribedUsers.email, invoice.customer_email || ""))
        .limit(1);

      const subscriptionData = {
        email: invoice.customer_email || "",
        userId: invoice.customer as string,
        type: event.type,
        subscriptionStatus: invoice.status || null,
        currentPlan: amount < 6 ? "AI_Agent" : determinePlan(invoice.amount_paid),
        nextInvoiceDate: calculateNextInvoiceDate(),
        InvoicePdfUrl: invoice.hosted_invoice_url || null,
      };

      if (existingUser.length > 0) {
        await db
          .update(subscribedUsers)
          .set(subscriptionData)
          .where(eq(subscribedUsers.email, invoice.customer_email || ""));
        console.log("Successfully updated existing user");
      } else {
        await db.insert(subscribedUsers).values(subscriptionData);
        console.log("Successfully created new user");
      }
    } catch (dbError) {
      console.error("Failed to save to subscribedUsers:", dbError);
      throw dbError;
    }

    return NextResponse.json({
      status: "success",
      event: event.type,
    });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    // Return a 400 error instead of 200 for webhook processing failures
    return new NextResponse(
      JSON.stringify({ 
        status: "Failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      }), 
      { status: 400 }
    );
  }
}

// Helper functions
function determinePlan(amountPaid: number): string {
  const amount = amountPaid / 100;
  if (amount < 6) {
    return amount === Number(process.env.NEXT_PUBLIC_STRIPE_STANDARD_AMOUNT) 
      ? "AI_Agent_Standard" 
      : "AI_Agent_Premium";
  } else if (amount >= 8 && amount < 100) {
    return "Monthly";
  } else if (amount >= 100) {
    return "Yearly";
  }
  return "Unknown";
}

function calculateNextInvoiceDate(): Date {
  return new Date(new Date().setDate(new Date().getDate() + 30));
}
