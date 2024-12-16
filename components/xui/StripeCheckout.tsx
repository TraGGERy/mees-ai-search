// components/xui/StripeCheckout.tsx
"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useCallback } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface StripeCheckoutProps {
  priceId: string;
}

export default function StripeCheckout({ priceId }: StripeCheckoutProps) {
  const handleCheckout = useCallback(async () => {
    const stripe = await stripePromise;
    if (!stripe) return;

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/cancel`,
    });

    if (error) {
      console.error("Stripe checkout error:", error);
    }
  }, [priceId]);

  return (
    <button
      onClick={handleCheckout}
      className="mt-8 block w-full rounded-full bg-purple-600 px-8 py-3 text-center text-sm font-medium text-white shadow-xl transition-all duration-200 ease-in-out transform hover:bg-purple-700 hover:scale-105"
    >
      Subscribe
    </button>
  );
}
