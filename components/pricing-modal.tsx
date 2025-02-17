'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { StripeCheckout } from './stripe-checkout'
import { UpgradeButton } from './upgrade-button'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  remaining?: number
}

export function PricingModal({ isOpen, onClose, remaining = 0 }: PricingModalProps) {
  const router = useRouter()
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[800px] p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-3xl text-center">Unlock Premium Features</DialogTitle>
          <DialogDescription className="pt-3 text-sm md:text-lg text-center">
            {remaining === 0 ? (
              "You've reached your daily limit for advanced models."
            ) : (
              `You have ${remaining} free searches remaining today.`
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 md:gap-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Monthly Plan */}
            <div className="p-4 md:p-6 border rounded-xl hover:border-primary transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Monthly Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl md:text-3xl font-bold text-primary">$9.50</p>
                    <span className="text-sm text-muted-foreground line-through">$20</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">per month</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full self-start">Most Popular</span>
              </div>
              <ul className="space-y-2 mt-4 md:mt-6 text-sm md:text-base">
                <li className="flex items-center">✓ All premium features</li>
                <li className="flex items-center">✓ Priority customer support</li>
                <li className="flex items-center">✓ Unlimited access</li>
              </ul>
              <StripeCheckout 
                priceId={process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || ''}
              >
              </StripeCheckout>
            </div>

            {/* Lifetime Plan */}
            <div className="p-4 md:p-6 border rounded-xl hover:border-primary transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Lifetime Access</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl md:text-3xl font-bold text-primary">$200</p>
                    <span className="text-sm text-muted-foreground line-through">$500</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">one-time payment</p>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full self-start">Save 51%</span>
              </div>
              <ul className="space-y-2 mt-4 md:mt-6 text-sm md:text-base">
                <li className="flex items-center">✓ All premium features</li>
                <li className="flex items-center">✓ Premium support forever</li>
                <li className="flex items-center">✓ Exclusive beta features</li>
              </ul>
              <StripeCheckout 
                priceId={process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID || ''}
              >
              </StripeCheckout>
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={() => {
              onClose();
              router.push('/');
            }}
            className="self-center px-4 md:px-8 text-sm md:text-base text-muted-foreground hover:text-primary"
          >
            Continue with Free Version
          </Button>

          
        </div>
      </DialogContent>
    </Dialog>
  )
} 