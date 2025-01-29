import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Sidebar } from '@/components/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { AppStateProvider } from '@/lib/utils/app-state'
import { ClerkProvider } from "@clerk/nextjs";
import AdSense from '@/components/AdSense';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SignInButton, SignOutButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { Sidebarmees } from '@/components/sidebarmees'
import { ServiceWorkerRegistrar } from '@/components/service-worker-registrar'
import NotificationHandler from './components/NotificationHandler'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Mees AI - Advanced AI Search Engine | Smart Answers & Real-Time Insights';
const description =
  'Get instant AI-powered answers with Mees AI, the intelligent search engine. Explore real-time results, expert insights, and comprehensive solutions for research, education, and technical queries.';
const keywords = [
  'AI search engine',
  'smart answers',
  'real-time AI',
  'research assistant',
  'academic search',
  'question answering system',
  'AI-powered insights',
  'knowledge engine',
  'instant answers',
  'study tool'
].join(', ');
const image = 'https://www.mees-ai.co.zw/opengraph-image.png';   

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
  }
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
  
  return (

    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mees AI" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <AdSense pId="7574084780651527"/>
        <ServiceWorkerRegistrar />
      </head>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
       <Analytics />
       <SpeedInsights/>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppStateProvider>
            <Header />
            {children}
            <Sidebarmees/>
           
            <Footer />
            <Toaster />
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
    
    </ClerkProvider>
  )
}
