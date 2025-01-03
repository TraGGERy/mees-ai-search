'use client'

import { useEffect } from 'react';
import StripeCheckout from "@/components/xui/StripeCheckout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/lib/utils/fontawesome';

config.autoAddCss = false;

export default function Price() {
  useEffect(() => {
    import('@/lib/utils/fontawesome');
  }, []);

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-purple-800 mb-12">Choose Your Plan</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Free Plan */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-105">
            <div className="p-8">
              <div className="flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={['fas', 'cogs']} className="text-4xl text-purple-500 mr-3" />
                <h2 className="text-2xl font-semibold text-purple-900">Free Plan</h2>
              </div>
              <p className="text-center text-4xl font-bold text-purple-900 mb-6">
                $0 <span className="text-xl font-medium text-purple-600">/month</span>
                <FontAwesomeIcon icon={['fas', 'check-circle']} className="text-blue-500 ml-2" title="Addictive Plan" />
              </p>
              <ul className="text-purple-700 space-y-3">
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Mees AI</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> ChatGPT-4o Mini</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Google Gemini Pro</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Unlimited History</li>
              </ul>
            </div>
            <div className="p-4">
              <a href="/" className="block w-full text-center bg-purple-600 text-white rounded-full py-3 font-medium hover:bg-purple-700 transition duration-300">
                Get Started
              </a>
            </div>
          </div>

          {/* Pro Monthly Plan */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-105">
            <div className="p-8">
              <div className="flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={['fas', 'star']} className="text-4xl text-yellow-500 mr-3" />
                <h2 className="text-2xl font-semibold text-purple-900">Pro Plan (Monthly)</h2>
              </div>
              <p className="text-center text-4xl font-bold text-purple-900 mb-6">
                ${process.env.NEXT_PUBLIC_MONTHLY_PRICE} <span className="text-xl font-medium text-purple-600">/month</span>
              </p>
              <ul className="text-purple-700 space-y-3">
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> ChatGPT-4o</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Claude Haku</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Claude Sonnet 3.5</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Unlimited Follow-up Questions</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Customer Support</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Early Access to New Tools</li>
              </ul>
            </div>
            <div className="p-4">
              <StripeCheckout priceId={process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || ''} />
            </div>
          </div>

          {/* Pro Yearly Plan */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-105">
            <div className="p-8">
              <div className="flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={['fas', 'crown']} className="text-4xl text-yellow-500 mr-3" />
                <h2 className="text-2xl font-semibold text-purple-900">Pro Plan (Yearly)</h2>
              </div>
              <p className="text-center text-4xl font-bold text-purple-900 mb-6">
                ${process.env.NEXT_PUBLIC_YEARLY_PRICE} <span className="text-xl font-medium text-purple-600">/year</span>
              </p>
              <ul className="text-purple-700 space-y-3">
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> ChatGPT-4o</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Claude Haku</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Claude Sonnet 3.5</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Unlimited Follow-up Questions</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Customer Support</li>
                <li className="flex items-center"><FontAwesomeIcon icon={['fas', 'check-circle']} className="text-green-500 mr-2" /> Early Access to New Tools</li>
              </ul>
            </div>
            <div className="p-4">
              <StripeCheckout priceId={process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || ''} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

