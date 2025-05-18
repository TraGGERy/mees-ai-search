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
import { useEffect, useState } from 'react'
import { StripeCheckout } from './stripe-checkout'

interface PricingDetails {
  currency: string;
  monthlyPrice: number;
  weeklyPrice: number;
  lifetimePrice: number;
  monthlyPriceId: string;
  weeklyPriceId: string;
  lifetimePriceId: string;
}

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectFree: () => void
  remaining?: number
}

export function PricingModal({ isOpen, onClose, onSelectFree, remaining = 0 }: PricingModalProps) {
  const router = useRouter()
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)
  const [pricingDetails, setPricingDetails] = useState<PricingDetails>({
    currency: '€',
    monthlyPrice: 12,
    weeklyPrice: 2.99,
    lifetimePrice: 49,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
    weeklyPriceId: '',
    lifetimePriceId: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID || ''
  });
  const [region, setRegion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPricingData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/geolocation');
        if (response.ok) {
          const data = await response.json();
          setPricingDetails(data.pricingDetails);
          setRegion(data.region);
        }
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPricingData();
  }, []);

  // Helper function to format currency display
  const formatCurrency = (currency: string) => {
    if (currency === 'â¬' || currency === '\u20AC' || 
        currency === '&euro;' || currency === '\u0026euro;' || 
        currency === 'EUR') {
      return '€';
    }
    return currency;
  };

  // Helper function to display the monthly savings percentage
  const calculateSavings = (weekly: number, monthly: number) => {
    // Calculate the cost of 4 weeks at weekly rate
    const fourWeeksAtWeeklyRate = weekly * 4;
    // Calculate the savings percentage
    const savingsPercentage = Math.round((1 - monthly / fourWeeksAtWeeklyRate) * 100);
    return savingsPercentage > 0 ? savingsPercentage : 0;
  };

  // Helper function to calculate lifetime savings vs 2 years of monthly
  const calculateLifetimeSavings = (monthly: number, lifetime: number) => {
    // Calculate the cost of 2 years (24 months) at monthly rate
    const twoYearsAtMonthlyRate = monthly * 24;
    // Calculate the savings percentage
    const savingsPercentage = Math.round((1 - lifetime / twoYearsAtMonthlyRate) * 100);
    return savingsPercentage > 0 ? savingsPercentage : 0;
  };

  const monthlySavings = calculateSavings(pricingDetails.weeklyPrice, pricingDetails.monthlyPrice);
  const lifetimeSavings = calculateLifetimeSavings(pricingDetails.monthlyPrice, pricingDetails.lifetimePrice);

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
          {region && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Showing prices for your region: {region.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
          )}
        </DialogHeader>
        <div className="flex flex-col gap-4 md:gap-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Weekly Plan */}
            <div className="p-4 md:p-6 border rounded-xl hover:border-primary transition-all">
              <div className="flex flex-col justify-between items-start gap-2">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Weekly Access</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      {isLoading ? '...' : `${formatCurrency(pricingDetails.currency)}${pricingDetails.weeklyPrice.toFixed(2)}`}
                    </p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">per week</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full self-start">Flexible</span>
              </div>
              <ul className="space-y-2 mt-4 md:mt-6 text-sm md:text-base">
                <li className="flex items-center">✓ All premium features</li>
                <li className="flex items-center">✓ 7-day full access</li>
                <li className="flex items-center">✓ Perfect for short projects</li>
              </ul>
              <StripeCheckout 
                priceId={pricingDetails.weeklyPriceId}
              >
              </StripeCheckout>
            </div>

            {/* Monthly Plan */}
            <div className="p-4 md:p-6 border rounded-xl hover:border-primary transition-all ring-2 ring-primary">
              <div className="flex flex-col justify-between items-start gap-2">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Monthly Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      {isLoading ? '...' : `${formatCurrency(pricingDetails.currency)}${pricingDetails.monthlyPrice}`}
                    </p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">per month</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full self-start">
                  Save {monthlySavings}%
                </span>
              </div>
              <ul className="space-y-2 mt-4 md:mt-6 text-sm md:text-base">
                <li className="flex items-center">✓ All premium features</li>
                <li className="flex items-center">✓ Priority customer support</li>
                <li className="flex items-center">✓ Unlimited access</li>
              </ul>
              <StripeCheckout 
                priceId={pricingDetails.monthlyPriceId}
              >
              </StripeCheckout>
            </div>

            {/* Lifetime Plan */}
            <div className="p-4 md:p-6 border rounded-xl hover:border-primary transition-all">
              <div className="flex flex-col justify-between items-start gap-2">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Lifetime Access</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      {isLoading ? '...' : `${formatCurrency(pricingDetails.currency)}${pricingDetails.lifetimePrice}`}
                    </p>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">one-time payment</p>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full self-start">
                  Save {lifetimeSavings}%
                </span>
              </div>
              <ul className="space-y-2 mt-4 md:mt-6 text-sm md:text-base">
                <li className="flex items-center">✓ All premium features</li>
                <li className="flex items-center">✓ Premium support forever</li>
                <li className="flex items-center">✓ Exclusive beta features</li>
              </ul>
              <StripeCheckout 
                priceId={pricingDetails.lifetimePriceId}
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