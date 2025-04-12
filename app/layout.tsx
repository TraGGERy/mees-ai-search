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
  title: {
    default: 'Mees AI - Intelligent Search Companion',
    template: '%s | Mees AI'
  },
  description: 'Your intelligent companion for precise and personalized search results',
  keywords: ['AI search', 'intelligent search', 'research assistant', 'search engine'],
  authors: [{ name: 'Mees AI Team' }],
  creator: 'Mees AI',
  publisher: 'Mees AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mees AI'
  },
  applicationName: 'Mees AI',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  icons: {
    icon: [
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/60.png', sizes: '60x60', type: 'image/png' },
      { url: '/icons/76.png', sizes: '76x76', type: 'image/png' },
      { url: '/icons/120.png', sizes: '120x120', type: 'image/png' },
      { url: '/icons/152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/icons/icon-144x144.png',
    'msapplication-config': '/browserconfig.xml'
  },
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
