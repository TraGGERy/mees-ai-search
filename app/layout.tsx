import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Sidebar } from '@/components/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { ClerkProvider } from "@clerk/nextjs";
import AdSense from '@/components/AdSense'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Mees Ai'
const description =
  'Discover Mees AI Search Engine, the next generation in search technology. Our fully open-source, AI-powered answer engine features a sleek, generative UI, delivering precise and relevant answers effortlessly. Experience an intuitive and intelligent search designed to transform the way you find information. Welcome to the future of search with Mees AI'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mees.co.nz/ai'),
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
        <meta name="google-adsense-account" content="ca-pub-7574084780651527"></meta>
      </head>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Sidebar />
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  )
}
