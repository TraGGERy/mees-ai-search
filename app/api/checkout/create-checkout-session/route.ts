import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Check if this is a one-time payment (lifetime) or subscription
    // You can either check the priceId directly or fetch the price from Stripe
    const isLifetimePlan = priceId === process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID;
    
    // Create checkout session with appropriate mode
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isLifetimePlan ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/canceled`,
      customer_email: userEmail,
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
      // Only include subscription_data for subscription mode
      ...(isLifetimePlan ? {} : {
        subscription_data: {
          trial_period_days: 7,
        },
      }),
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 