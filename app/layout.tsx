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
            <NotificationHandler />
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
    
    </ClerkProvider>
  )
}
