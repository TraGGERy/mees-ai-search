import Stripe from "stripe";
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { subscribedUsers, subscriptionEvents } from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
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

    console.log("Event:", event.type);

    // Only handle 'invoice.payment_succeeded' event
    if (event.type !== "invoice.payment_succeeded") {
      return NextResponse.json({
        status: "Ignored",
        message: "Only handling invoice.payment_succeeded events.",
      });
    }

    const invoice = event.data.object as Stripe.Invoice; // Correctly casting to Invoice object
    const userId = invoice.customer as string; // Stripe customer ID
    const email = invoice.customer_email || ""; // Default fallback if email is null
    const subscriptionStatus = invoice.status; // Assuming status is 'paid' when payment is successful
    const receiptUrl = invoice.hosted_invoice_url || null; // Extract the receipt URL
    const amountPaid = invoice.amount_paid / 100;
    let currentPlan = "Pro"; // Assume "Pro" plan
    if (amountPaid >= 7.99 && amountPaid <= 20) {
      currentPlan = "Monthly";
    } else if (amountPaid > 100) {
      currentPlan = "Yearly";
    }
    const nextInvoiceDate = new Date(new Date().setDate(new Date().getDate() + 30)); // Set next invoice date to 30 days from now

    // Insert the event data into the subscriptionEvents table
    await db.insert(subscriptionEvents).values({
      eventId: event.id,
      eventPayload: event,
      email: email,
    });

    // Check if the user already exists in the subscribedUsers table
    const existingUser = await db
      .select()
      .from(subscribedUsers)
      .where(eq(subscribedUsers.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      // User exists, update their subscription data
      await db
        .update(subscribedUsers)
        .set({
          type: event.type,
          subscriptionStatus: subscriptionStatus || null,
          currentPlan: currentPlan || null,
          nextInvoiceDate: nextInvoiceDate || null,
          InvoicePdfUrl: receiptUrl || null, // Save the receipt URL
        })
        .where(eq(subscribedUsers.email, email));
    } else {
      // User doesn't exist, insert a new record
      await db.insert(subscribedUsers).values({
        email: email,
        userId: userId, // Set the Stripe customer ID as userId
        type: event.type,
        subscriptionStatus: subscriptionStatus || null,
        currentPlan: currentPlan || null,
        nextInvoiceDate: nextInvoiceDate || null,
        InvoicePdfUrl: receiptUrl || null, // Save the receipt URL
      });
    }

    return NextResponse.json({
      status: "success",
      event: event.type,
    });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json({ status: "Failed", error: error });
  }
}
