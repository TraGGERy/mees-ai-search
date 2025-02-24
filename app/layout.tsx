import Footer from '@/components/footer'
import Header from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Mees AI - Advanced AI Search Engine | Smart Answers & Real-Time Insights';
const description =
  'Get instant AI-powered answers with Mees AI, the intelligent search engine. Explore real-time results, expert insights, and comprehensive solutions for research, education, and technical queries.';
const keywords = [
  'AI search engine',
  'MeesAI.app',
  'AI search engine',
  'smart answers',
  'real-time AI',
  'research assistant',
  'academic search',
  'question answering system',
  'AI-powered insights',
  'knowledge engine',
  'instant answers',
  'study tool',
  "search engine",
    "AI",
    "perplexity.ai",
    "perplexity",
    'andra search',
    "open source ai search engine",
    "minimalistic ai search engine",
].join(', ');
const image = 'https://mees-ai-search.vercel.app/opengraph-image.png';   

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mees-ai.co.zw'),
  title,
  description,
  keywords,
  authors: [{ name: 'Mees AI Team' }],
  creator: 'Mees AI',
  publisher: 'Mees AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mees-ai.co.zw',
    title: 'Mees AI - Next-Gen AI Search & Answer Engine',
    description: 'Instant AI-powered answers for complex queries - Research, Education, Technology & More',
    siteName: 'Mees AI',
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: 'Mees AI - Advanced AI Search Engine'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mees AI - Smart Search & AI Answers',
    description: 'Get real-time AI insights and expert-level answers instantly',
    creator: '@Iamtoxix',
    site: '@Iamtoxix',
    images: [image],
  },
  alternates: {
    canonical: 'https://www.mees-ai.co.zw'
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mees AI',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const enableSaveChatHistory =
    process.env.NEXT_PUBLIC_ENABLE_SAVE_CHAT_HISTORY === 'true'
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <ClerkProvider>
         <Analytics />
         <SpeedInsights/>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <Header />
            {children}
            {enableSaveChatHistory && <Sidebar />}
            <Footer />
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
