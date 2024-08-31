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

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Mees Ai'
const description =
  'A fully open-source AI-powered answer engine with a generative UI.'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mees.co.nz/'),
  title,
  description,
  openGraph: {
    title,
    description
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
            
            {children}
            
            
            <Toaster />
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
    
    </ClerkProvider>
  )
}
