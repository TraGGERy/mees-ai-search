'use client'

import { WorldMap } from '@/components/ui/world-map'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HomePage() {
  // Animation variants
  const staggerContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const fadeInUp = {
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
              {["The", "Next-Generation", "AI", "Search", "Engine"].map((word, i) => (
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
            Mees AI combines multiple advanced AI models to deliver precise, comprehensive search results beyond traditional search engines
          </p>
          
          <motion.div 
            className="search-demo mt-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
           
          </motion.div>
        </motion.section>

        <motion.section
          variants={fadeInUp} 
          className="search-features grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 mt-8"
        >
          <FeatureCard 
            title="Intelligent Search"
            description="Powered by multiple AI models to understand context and intent behind every search"
            features={["Natural language understanding", "Context-aware results", "Multi-source verification"]}
          />
          <FeatureCard
            title="Advanced Filtering" 
            description="Smart categorization and filtering of results for better discovery"
            features={["Real-time filtering", "Semantic grouping", "Relevance ranking"]}
          />
          <FeatureCard
            title="Deep Web Analysis"
            description="Access and analyze information from across the entire web"
            features={["Comprehensive coverage", "Deep web access", "Real-time updates"]}
          />
        </motion.section>

        <motion.section
          variants={fadeInUp}
          className="ai-models py-8 sm:py-12 backdrop-blur-sm bg-black/20 rounded-xl"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Powered by Advanced AI Models</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <ModelCard
              title="DeepSeek R1"
              description="Deep semantic understanding for accurate search results"
              features={["Contextual analysis", "Intent recognition", "Semantic search"]}
            />
            <ModelCard
              title="Anthropic Claude"
              description="Ethical AI ensuring reliable and unbiased search results"
              features={["Fact verification", "Bias detection", "Source credibility"]}
            />
            <ModelCard
              title="Gemini 2.0"
              description="Multimodal search capabilities for comprehensive results"
              features={["Image recognition", "Video analysis", "Cross-modal search"]}
            />
          </div>
        </motion.section>

        <motion.section
          variants={fadeInUp}
          className="benefits-section mt-12 mb-8"
        >
          <h2 className="text-2xl sm:text-3xl text-center mb-8">Why Choose Mees AI Search</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <BenefitCard
              title="Faster Results"
              description="Get instant, relevant results powered by AI"
            />
            <BenefitCard
              title="Smarter Search"
              description="Understanding context and intent behind queries"
            />
            <BenefitCard
              title="Better Accuracy"
              description="Multi-model verification for reliable results"
            />
            <BenefitCard
              title="Privacy Focus"
              description="Secure, private, and transparent searching"
            />
          </div>
        </motion.section>
      </motion.main>
    </div>
  )
}

interface ModelCardProps {
  title: string
  description: string
  features: string[]
}

const ModelCard = ({ title, description, features }: ModelCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02, translateY: -5 }}
    className="p-4 sm:p-6 rounded-xl shadow-lg bg-opacity-10 backdrop-blur-md bg-white/5 border border-gray-700/30 hover:border-purple-500/30 transition-all touch-pan-y"
  >
    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-purple-300">{title}</h3>
    <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">{description}</p>
    <ul className="space-y-1.5 sm:space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-xs sm:text-sm text-gray-400">
          <span className="mr-2">•</span>
          {feature}
        </li>
      ))}
    </ul>
  </motion.div>
)

interface FeatureCardProps {
  title: string
  description: string
  features: string[]
}

const FeatureCard = ({ title, description, features }: FeatureCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02, translateY: -5 }}
    className="p-4 sm:p-6 rounded-xl shadow-lg bg-opacity-10 backdrop-blur-md bg-white/5 border border-gray-700/30 hover:border-purple-500/30 transition-all touch-pan-y"
  >
    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-purple-300">{title}</h3>
    <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">{description}</p>
    <ul className="space-y-1.5 sm:space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-xs sm:text-sm text-gray-400">
          <span className="mr-2">•</span>
          {feature}
        </li>
      ))}
    </ul>
  </motion.div>
)

interface BenefitCardProps {
  title: string
  description: string
}

const BenefitCard = ({ title, description }: BenefitCardProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-4 text-center rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700/30"
  >
    <h3 className="text-lg font-semibold mb-2 text-blue-300">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </motion.div>
) 