import { db } from "@/db/db";
import { subscribedUsers, subscriptionEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("Webhook received:", event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Processing completed checkout:", session.id);

        // Get the subscription to check trial status
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const isTrialing = subscription.status === 'trialing';
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

        // Save subscription data
        await db.insert(subscribedUsers).values({
          email: session.customer_email || '',
          userId: session.metadata?.userId || '',
          stripeCustomerId: session.customer as string,
          type: 'subscription',
          subscriptionStatus: isTrialing ? 'trialing' : 'active',
          currentPlan: session.amount_total && session.amount_total >= 10000 ? 'yearly' : 'monthly',
          nextInvoiceDate: trialEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }).onConflictDoUpdate({
          target: [subscribedUsers.email],
          set: {
            subscriptionStatus: isTrialing ? 'trialing' : 'active',
            stripeCustomerId: session.customer as string,
            currentPlan: session.amount_total && session.amount_total >= 10000 ? 'yearly' : 'monthly',
            nextInvoiceDate: trialEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        });

        // Log the event
        await db.insert(subscriptionEvents).values({
          eventId: event.id,
          eventType: event.type,
          email: session.customer_email || '',
          eventPayload: JSON.stringify(event),
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Processing subscription update:", subscription.id);

        // Update subscription status based on trial status
        const isTrialing = subscription.status === 'trialing';
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

        await db.update(subscribedUsers)
          .set({
            subscriptionStatus: isTrialing ? 'trialing' : 'active',
            nextInvoiceDate: trialEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          })
          .where(eq(subscribedUsers.stripeCustomerId, subscription.customer as string));

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Processing invoice payment:", invoice.id);
        
        // Update subscription status
        if (invoice.customer_email) {
          await db.update(subscribedUsers)
            .set({
              subscriptionStatus: 'active',
              nextInvoiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })
            .where(eq(subscribedUsers.email, invoice.customer_email));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 
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
  } else if (amount >= 200) {
    return "Lifetime";
  }
  return "Unknown";
}

function calculateNextInvoiceDate(): Date {
  return new Date(new Date().setDate(new Date().getDate() + 30));
}