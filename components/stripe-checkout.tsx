// components/xui/StripeCheckout.tsx
"use client";

import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// Load Stripe outside of component to avoid recreating Stripe object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

interface StripeCheckoutProps {
  priceId: string
  buttonText?: string
}

export function StripeCheckout({ priceId, buttonText = 'Upgrade' }: StripeCheckoutProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/checkout/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user?.id,
          userEmail: user?.emailAddresses[0]?.emailAddress
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const { sessionId } = await response.json()
      
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        throw error
      }

    } catch (err) {
      console.error('Error:', err)
      alert('Failed to process payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleCheckout}
      disabled={loading}
      className="w-full"
    >
      {loading ? 'Processing...' : buttonText}
    </Button>
  )
}
