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
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] lg:max-w-[900px] p-3 sm:p-4 md:p-6 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-center leading-tight">
            Unlock Premium Features
          </DialogTitle>
          <DialogDescription className="pt-2 sm:pt-3 text-xs sm:text-sm md:text-base lg:text-lg text-center px-2">
            {remaining === 0 ? (
              "You've reached your daily limit for advanced models."
            ) : (
              `You have ${remaining} free searches remaining today.`
            )}
          </DialogDescription>
          {region && (
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 px-2">
              Showing prices for your region: {region.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </p>
          )}
        </DialogHeader>
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Weekly Plan */}
            <div className="p-3 sm:p-4 md:p-6 border rounded-xl hover:border-primary transition-all">
              <div className="flex flex-col justify-between items-start gap-2 sm:gap-3">
                <div className="w-full">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">Weekly Access</h3>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                      {isLoading ? '...' : `${formatCurrency(pricingDetails.currency)}${pricingDetails.weeklyPrice.toFixed(2)}`}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">per week</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full self-start">Flexible</span>
              </div>
              <ul className="space-y-1 sm:space-y-2 mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm md:text-base">
                <li className="flex items-center gap-2">✓ All premium features</li>
                <li className="flex items-center gap-2">✓ 7-day full access</li>
                <li className="flex items-center gap-2">✓ Perfect for short projects</li>
              </ul>
              <div className="mt-3 sm:mt-4 md:mt-6">
                <StripeCheckout 
                  priceId={pricingDetails.weeklyPriceId}
                >
                </StripeCheckout>
              </div>
            </div>

            {/* Monthly Plan */}
            <div className="p-3 sm:p-4 md:p-6 border-2 border-primary rounded-xl relative">
              <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">Most Popular</span>
              </div>
              <div className="flex flex-col justify-between items-start gap-2 sm:gap-3 mt-2 sm:mt-0">
                <div className="w-full">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">Monthly Access</h3>
                  <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                      {isLoading ? '...' : `${formatCurrency(pricingDetails.currency)}${pricingDetails.monthlyPrice.toFixed(2)}`}
                    </p>
                    <span className="text-xs sm:text-sm text-muted-foreground line-through">
                      {isLoading ? '...' : `${formatCurrency(pricingDetails.currency)}${(pricingDetails.weeklyPrice * 4).toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">per month</p>
                  <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">
                    Save {isLoading ? '...' : calculateSavings(pricingDetails.monthlyPrice, pricingDetails.weeklyPrice * 4)}%
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full self-start">Best Value</span>
              </div>
              <ul className="space-y-1 sm:space-y-2 mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm md:text-base">
                <li className="flex items-center gap-2">✓ All premium features</li>
                <li className="flex items-center gap-2">✓ 30-day full access</li>
                <li className="flex items-center gap-2">✓ Best value for regular users</li>
              </ul>
              <div className="mt-3 sm:mt-4 md:mt-6">
                <StripeCheckout 
                  priceId={pricingDetails.monthlyPriceId}
                >
                </StripeCheckout>
              </div>
            </div>

            {/* Lifetime Plan */}
            <div className="p-3 sm:p-4 md:p-6 border rounded-xl hover:border-primary transition-all">
              <div className="flex flex-col justify-between items-start gap-2 sm:gap-3">
                <div className="w-full">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">Lifetime Access</h3>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                      {isLoading ? '...' : `${formatCurrency(pricingDetails.currency)}${pricingDetails.lifetimePrice}`}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">one-time payment</p>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full self-start">
                  Save {lifetimeSavings}%
                </span>
              </div>
              <ul className="space-y-1 sm:space-y-2 mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm md:text-base">
                <li className="flex items-center gap-2">✓ All premium features</li>
                <li className="flex items-center gap-2">✓ Premium support forever</li>
                <li className="flex items-center gap-2">✓ Exclusive beta features</li>
              </ul>
              <div className="mt-3 sm:mt-4 md:mt-6">
                <StripeCheckout 
                  priceId={pricingDetails.lifetimePriceId}
                >
                </StripeCheckout>
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={() => {
              onClose();
              router.push('/');
            }}
            className="self-center px-3 sm:px-4 md:px-8 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-muted-foreground hover:text-primary w-full sm:w-auto max-w-xs"
          >
            Continue with Free Version
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}