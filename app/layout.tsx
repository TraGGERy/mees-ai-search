import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Toaster } from '@/components/ui/sonner'
import { AppStateProvider } from '@/lib/utils/app-state'
import { ClerkProvider } from "@clerk/nextjs";
import AdSense from '@/components/AdSense';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SignInButton, SignOutButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { Sidebarmees } from '@/components/sidebarmees'
import Loading from '@/components/loading';
import { Suspense } from 'react';
import { initializeErrorHandling } from '@/app/lib/error-handler'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Mees Ai'
const description =
  'Mees AI is an advanced answer engine with a dynamic, real-time interface.'
  const image = 'https://mees-ai-search.vercel.app/opengraph-image.png';   

export const metadata: Metadata = {
  metadataBase: new URL('https://mees-ai-search.vercel.app'),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: image,
        width: 1200, // optional, specify width if needed
        height: 630, // optional, specify height if needed
        alt: 'Mees AI Thumbnail' // optional, add alternative text for the image
      }
    ]
  },

  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@Iamtoxix'
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
  // Initialize error handling
  if (typeof window !== 'undefined') {
    initializeErrorHandling();
  }

  return (

    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-7574084780651527"/>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mees AI" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
          href="/splash/apple-splash-2048-2732.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
          href="/splash/apple-splash-1668-2388.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
          href="/splash/apple-splash-1536-2048.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash/apple-splash-1242-2688.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
          href="/splash/apple-splash-1125-2436.png"
        />
        <AdSense pId="7574084780651527"/>
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
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
            
            <Sidebarmees />
            <Footer />
            <Toaster />
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
    
    </ClerkProvider>
  )
}
