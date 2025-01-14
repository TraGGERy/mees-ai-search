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

const title = 'Mees Ai - Advanced AI Search & Answer Engine'
const description =
  'Mees AI is an advanced answer engine powered by artificial intelligence, providing instant, accurate responses with a dynamic, real-time interface. Get smart answers to your questions instantly.'
const image = 'https://mees-ai-search.vercel.app/opengraph-image.png';   

export const metadata: Metadata = {
  metadataBase: new URL('https://mees-ai-search.vercel.app'),
  title,
  description,
  keywords: 'AI search engine, question answering, artificial intelligence, smart search, Mees AI, real-time answers',
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
    url: 'https://mees-ai-search.vercel.app',
    title,
    description,
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
    title,
    description,
    creator: '@Iamtoxix',
    site: '@Iamtoxix',
    images: [image],
  },
  alternates: {
    canonical: 'https://mees-ai-search.vercel.app'
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
