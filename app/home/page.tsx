'use client'

import { WorldMap } from '@/components/ui/world-map'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Define types for regional pricing
interface PricingDetails {
  currency: string;
  monthlyPrice: number;
  weeklyPrice: number;
  lifetimePrice: number;
  monthlyPriceId?: string;
  weeklyPriceId?: string;
  lifetimePriceId?: string;
}

export default function HomePage() {
  // State for regional pricing
  const [pricingDetails, setPricingDetails] = useState<PricingDetails>({
    currency: '€',
    monthlyPrice: 12,
    weeklyPrice: 2.99,
    lifetimePrice: 49
  });
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState<string>('');

  // Fetch user's region on component mount
  useEffect(() => {
    async function fetchUserRegion() {
      try {
        const response = await fetch('/api/geolocation');
        if (response.ok) {
          const data = await response.json();
          setPricingDetails(data.pricingDetails);
          setRegion(data.region);
        }
      } catch (error) {
        console.error('Failed to fetch regional pricing:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRegion();
  }, []);

  // Animation variants
  const staggerContainer: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const fadeInUp: Variants = {
    hidden: {
      y: 30,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  // Sample connection points for the world map
  const connectionPoints = [
    {
      start: { lat: 40.7128, lng: -74.0060, label: "New York" }, // New York
      end: { lat: 51.5074, lng: -0.1278, label: "London" }, // London
    },
    {
      start: { lat: 35.6762, lng: 139.6503, label: "Tokyo" }, // Tokyo
      end: { lat: 1.3521, lng: 103.8198, label: "Singapore" }, // Singapore
    },
    {
      start: { lat: 48.8566, lng: 2.3522, label: "Paris" }, // Paris
      end: { lat: -33.8688, lng: 151.2093, label: "Sydney" }, // Sydney
    },
  ]

  return (
    <div className="relative min-h-screen w-full">
      {/* World Map Background */}
      <div className="fixed inset-0 z-0">
        <WorldMap 
          dots={connectionPoints}
          lineColor="var(--highlight-color, #0ea5e9)" // Will inherit from parent theme
        />
      </div>

      {/* Home Button */}
      <Link 
        href="/"
        className="fixed top-4 left-4 z-50 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-gray-700/30 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
          />
        </svg>
        <span>Home</span>
      </Link>

      {/* Main Content */}
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-transparent"
      >
        {/* Hero Section */}
        <motion.section 
          variants={fadeInUp}
          className="hero-section py-12 sm:py-16 md:py-20 backdrop-blur-sm bg-black/20 rounded-xl mt-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 sm:mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text leading-tight"
            >
              {["Smarter", "AI", "Search", "for", "Students,", "Researchers", "&", "Marketers"].map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className="inline-block mr-2"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          </motion.div>
          <p className="text-base sm:text-lg md:text-xl text-center max-w-3xl mx-auto text-gray-300 px-4">
            Powered by ChatGPT, Claude, Gemini and more — all in one place.
          </p>
          <p className="text-base sm:text-lg mt-4 text-center max-w-3xl mx-auto text-gray-400 px-4">
            Stop wasting time switching between tools. Mees AI gives you fast, focused answers from the world's best AI models — in a single, private workspace.
          </p>
          
          <motion.div 
            className="mt-8 flex justify-center"
            variants={fadeInUp}
          >
            <Link
              href="/search"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              Start Free – No Card Needed
            </Link>
          </motion.div>
        </motion.section>

        {/* Problem + Solution */}
        <motion.section
          variants={fadeInUp} 
          className="py-12 mt-12 backdrop-blur-sm bg-black/20 rounded-xl"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">AI Search Is Broken for Serious Work</h2>
          
          <div className="max-w-3xl mx-auto px-4">
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-xl mt-0.5">•</span>
                <p className="text-gray-300">You need answers with sources, not opinions.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-xl mt-0.5">•</span>
                <p className="text-gray-300">You need a tool that's private, not tracking your searches.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-xl mt-0.5">•</span>
                <p className="text-gray-300">You need something that works fast, not switching tabs endlessly.</p>
              </li>
            </ul>
            
            <p className="text-center text-xl font-medium text-gray-200">
              That&apos;s why we built Mees AI.
            </p>
            <p className="text-center text-lg text-gray-300 mt-2">
              A cleaner, faster, and more private AI search experience — made for real work.
            </p>
          </div>
        </motion.section>

        {/* Who It's For Section */}
        <motion.section
          variants={fadeInUp}
          className="mt-12 py-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Built for Europe&apos;s:</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
            <TargetUserCard
              title="University Students"
              description="Writing reports, essays, and citations"
              icon={
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              }
            />
            <TargetUserCard
              title="Researchers"
              description="Gathering insights, studies, and sources"
              icon={
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              }
            />
            <TargetUserCard
              title="Marketers"
              description="Generating content ideas, SEO plans, and brand strategy"
              icon={
                <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              }
            />
          </div>
        </motion.section>

        {/* Core Features Section */}
        <motion.section
          variants={fadeInUp} 
          className="features-section py-12 backdrop-blur-sm bg-black/20 rounded-xl mt-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Core Features</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            <FeatureCard 
              title="One Question. Multiple AI Answers."
              description="Get side-by-side answers from ChatGPT, Gemini, Claude, and more — no switching tabs."
              features={[]}
            />
            <FeatureCard
              title="Research-Ready Results" 
              description="Get summarized answers with source links, bullet-points, and export to PDF/Word."
              features={[]}
            />
            <FeatureCard
              title="Your Data Stays Yours"
              description="We're 100% privacy-first. No tracking. No selling data. Ever."
              features={[]}
            />
            <FeatureCard
              title="Save & Resume"
              description="Auto-save your search history and continue your work across devices."
              features={[]}
            />
            <FeatureCard
              title="Coming Soon: Offline Mode"
              description="Access AI even when the internet drops — perfect for campus, travel, or rural areas."
              features={[]}
            />
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          variants={fadeInUp}
          className="testimonials-section py-12 mt-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Why Europeans Choose Mees AI</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            <TestimonialCard
              quote="It's the only AI tool I trust to help with my coursework and citations."
              author="Lukas T."
              position="Student in Germany"
            />
            <TestimonialCard
              quote="For marketing briefs, this is faster than any AI tool I've tried."
              author="Ines D."
              position="Content Strategist in France"
            />
            <TestimonialCard
              quote="I use it daily to compare model responses in one view. A game-changer."
              author="Tomás M."
              position="Academic Researcher in Spain"
            />
          </div>
        </motion.section>

        {/* Pricing */}
        <motion.section
          variants={fadeInUp}
          className="pricing-section py-12 backdrop-blur-sm bg-black/20 rounded-xl mt-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">Simple Pricing. No Surprises.</h2>
          {region && 
            <p className="text-center text-sm text-blue-300 mt-2">
              Showing prices for your region: {region.replace(&apos;_&apos;, &apos; &apos;).replace(/\b\w/g, c => c.toUpperCase())}
            </p>
          }
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-8 px-4">
            <PricingCard
              title="Free Plan"
              price={isEuroSymbol(pricingDetails.currency) ? '€0' : `${pricingDetails.currency}0`}
              features={[
                "Limited daily searches",
                "Basic access"
              ]}
              ctaText="Start Free"
              ctaLink="/search"
              highlighted={false}
              priceId=""
            />
            <PricingCard
              title="Weekly Pass"
              price={isEuroSymbol(pricingDetails.currency) 
                ? `€${pricingDetails.weeklyPrice.toFixed(2)}` 
                : `${pricingDetails.currency}${pricingDetails.weeklyPrice.toFixed(2)}`}
              period="/week"
              features={[
                "Full access for 7 days",
                "Unlimited searches",
                "Perfect for short projects"
              ]}
              ctaText="Get Weekly Pass"
              ctaLink={`/success?price=${pricingDetails.weeklyPriceId}`}
              highlighted={false}
              priceId={pricingDetails.weeklyPriceId}
            />
            <PricingCard
              title="Pro Plan"
              price={isEuroSymbol(pricingDetails.currency) 
                ? `€${pricingDetails.monthlyPrice}` 
                : `${pricingDetails.currency}${pricingDetails.monthlyPrice}`}
              period="/month"
              features={[
                "Unlimited smart search",
                "Offline access (coming soon)",
                "Save & sync history"
              ]}
              ctaText="Upgrade to Pro"
              ctaLink={`/success?price=${pricingDetails.monthlyPriceId}`}
              highlighted={true}
              priceId={pricingDetails.monthlyPriceId}
            />
            <PricingCard
              title="Lifetime Access"
              price={isEuroSymbol(pricingDetails.currency) 
                ? `€${pricingDetails.lifetimePrice}` 
                : `${pricingDetails.currency}${pricingDetails.lifetimePrice}`}
              period=""
              features={[
                "Pay once, use forever",
                "All Pro features included",
                "Priority support",
                "Early access to new features"
              ]}
              ctaText="Get Lifetime Access"
              ctaLink={`/success?price=${pricingDetails.lifetimePriceId}`}
              highlighted={false}
              priceId={pricingDetails.lifetimePriceId}
            />
          </div>
          
          {isLoading && (
            <div className="text-center mt-4 text-gray-400 text-sm">
              <p>Loading regional pricing...</p>
            </div>
          )}
        </motion.section>

        {/* Call to Action Banner */}
        <motion.section
          variants={fadeInUp}
          className="cta-section py-12 mt-12 mb-12 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Do Better Work with Better Answers</h2>
          <p className="text-lg text-gray-300 mb-6">Try Mees AI free — no sign-up required.</p>
          
          <Link
            href="/search"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            Start Free – No Credit Card Needed
          </Link>
        </motion.section>

        {/* Footer */}
        <motion.footer
          variants={fadeInUp}
          className="footer-section py-8 border-t border-gray-800 text-center text-gray-400 text-sm"
        >
          <div className="flex justify-center space-x-4 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Mees AI Europe</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>|</span>
            <a href="mailto:contact@meesai.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p>Built in Africa. Trusted in Europe.</p>
          <p className="mt-2">© 2025 Mees AI Technologies</p>
        </motion.footer>
      </motion.main>
    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  features: string[]
}

const FeatureCard = ({ title, description, features }: FeatureCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02, translateY: -5 }}
    className="p-6 rounded-xl shadow-lg backdrop-blur-md bg-white/5 border border-gray-700/30 hover:border-purple-500/30 transition-all"
  >
    <h3 className="text-xl font-semibold mb-3 text-blue-300">{title}</h3>
    <p className="text-gray-300 mb-4">{description}</p>
    {features.length > 0 && (
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-400">
            <span className="mr-2">•</span>
            {feature}
          </li>
        ))}
      </ul>
    )}
  </motion.div>
)

interface TargetUserCardProps {
  title: string
  description: string
  icon: React.ReactNode
}

const TargetUserCard = ({ title, description, icon }: TargetUserCardProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-6 text-center rounded-xl backdrop-blur-md bg-white/5 border border-gray-700/30 hover:border-blue-500/30 transition-all"
  >
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
)

interface TestimonialCardProps {
  quote: string
  author: string
  position: string
}

const TestimonialCard = ({ quote, author, position }: TestimonialCardProps) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="p-6 rounded-xl backdrop-blur-md bg-white/5 border border-gray-700/30"
  >
    <p className="text-gray-200 mb-4 italic">"{quote}"</p>
    <div>
      <p className="font-medium text-white">– {author}</p>
      <p className="text-sm text-gray-400">{position}</p>
    </div>
  </motion.div>
)

interface PricingCardProps {
  title: string
  price: string
  period?: string
  features: string[]
  ctaText: string
  ctaLink: string
  highlighted: boolean
  priceId?: string
}

const PricingCard = ({ title, price, period = "", features, ctaText, ctaLink, highlighted, priceId }: PricingCardProps) => {
  // Format the price to display the correct currency symbol
  const formatPrice = (price: string) => {
    if (price.includes('â¬')) return price.replace('â¬', '€');
    if (price.includes('\u20AC')) return price.replace('\u20AC', '€');
    if (price.includes('&euro;')) return price.replace('&euro;', '€');
    if (price.includes('\u0026euro;')) return price.replace('\u0026euro;', '€');
    return price;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`p-6 rounded-xl backdrop-blur-md ${highlighted ? 'bg-gradient-to-b from-blue-900/40 to-purple-900/40 border-blue-500/30' : 'bg-white/5 border-gray-700/30'} border transition-all`}
    >
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-white">{formatPrice(price)}</span>
        {period && <span className="text-gray-400">{period}</span>}
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className={`block w-full py-2 text-center rounded-lg ${highlighted ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/10 text-white'} font-medium hover:opacity-90 transition-opacity`}
        data-price-id={priceId || ''}
      >
        {ctaText}
      </Link>
    </motion.div>
  )
}

function isEuroSymbol(currency: string): boolean {
  const euroSymbols = ['€', 'â¬', '\u20AC', '&euro;', '\u0026euro;', 'EUR'];
  return euroSymbols.some(symbol => currency.includes(symbol));
} 