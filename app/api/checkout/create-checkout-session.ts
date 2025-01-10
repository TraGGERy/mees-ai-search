import { NextResponse, NextRequest } from "next/server"; // To handle API request/response
import Stripe from "stripe"; // Stripe SDK for API calls
import { currentUser } from "@clerk/nextjs/server"; // To get the current logged-in user

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function createCheckoutSession(req: NextRequest) {
  try {
    // Retrieve the currently logged-in user
    const user = await currentUser();
    const userId = user ? user.id : "anonymous"; // Fallback to "anonymous" if no user

    // Define line items for the checkout session
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Pro Subscription",
          },
          unit_amount: 5000, // Example price in cents ($50)
        },
        quantity: 1,
      },
    ];

    // Create the Stripe checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      metadata: { clerkUserId: userId  }, // Directly add metadata here
    });

    // Log the userId for debugging purposes
    console.log("User ID:", userId);

    // Respond with the session ID to the frontend
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json({ status: "Failed", error: error });
  }
}
