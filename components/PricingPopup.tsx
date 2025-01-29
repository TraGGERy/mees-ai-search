import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Check, X, Brain, Globe } from 'lucide-react';
import { loadStripe } from "@stripe/stripe-js";
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface PricingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function PricingPopup({ isOpen, onClose, onUpgrade }: PricingPopupProps) {
  const [loadingPlan, setLoadingPlan] = useState<'standard' | null>(null);

  const handleCheckout = async (priceId: string) => {
    try {
      setLoadingPlan('standard');
      const stripe = await stripePromise;
      if (!stripe) {
        toast.error('Stripe failed to load');
        return;
      }

      await stripe.redirectToCheckout({
        lineItems: [{ price: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID, quantity: 1 }],
        mode: "subscription",
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`,
      });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      toast.error('Checkout failed');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-inherit p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                    Upgrade Your Experience
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="border rounded-lg p-6 border-purple-200 dark:border-purple-800 backdrop-blur-sm bg-purple-50/50 dark:bg-purple-900/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="h-6 w-6 text-purple-500" />
                      <h4 className="text-xl font-semibold">Pro Plan</h4>
                    </div>
                    <div className="mb-4">
                      <div className="text-2xl font-bold">$3.22</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">per month</div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        African Translator Access
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Tech Guru Consultations
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Financial & Health Advice
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Advanced Reasoning (Deepseek)
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Enhanced Analysis
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Priority Support
                      </li>
                    </ul>
                    <button 
                      onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || '')}
                      className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                      disabled={loadingPlan !== null}
                    >
                      {loadingPlan === 'standard' ? 'Processing...' : 'Upgrade Now'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 