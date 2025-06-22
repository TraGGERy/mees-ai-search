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

const title = 'Mees AI - Academic Search Engine | Research Assistant & Citation Generator';
const description =
  'The leading Academic Search Engine for researchers and students. Get instant, citation-ready answers, humanized AI responses, and specialized tools for academic research and assignments. Transform your research workflow with AI-powered academic search.';
const keywords = [
  'academic search engine',
  'research assistant',
  'citation generator',
  'AI for students',
  'academic writing',
  'research paper help',
  'assignment workflow',
  'humanized AI responses',
  'scholarly search',
  'academic citations',
  'student research tool',
  'academic AI assistant',
  'research paper writing',
  'citation management',
  'academic workflow',
  'student assignment help',
  'research paper generator',
  'academic content creation',
  'scholarly writing assistant',
  'academic knowledge engine',
  'academic search',
  'scholarly research',
  'academic database',
  'research search engine',
  'academic literature search'
].join(', ');
const image = 'https://mees-ai-search.vercel.app/opengraph-image.png';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mees-ai.app'),
  title: {
    default: 'Mees AI - Academic Search Engine & Research Assistant',
    template: '%s | Mees AI Academic Search'
  },
  description: 'The leading Academic Search Engine for researchers and students. Get citation-ready answers and humanized AI responses for your academic work.',
  keywords: ['academic search engine', 'research assistant', 'citation generator', 'student research', 'academic writing'],
  authors: [{ name: 'Mees AI Academic Team' }],
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
    title: 'Mees AI Research'
  },
  applicationName: 'Mees AI Research Assistant',
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
    url: 'https://www.mees-ai.app',
    title: 'Mees AI - Academic Search Engine for Research & Writing',
    description: 'Transform your research with our Academic Search Engine. Get AI-powered academic search, citations, and humanized responses. Perfect for students and researchers.',
    siteName: 'Mees AI Academic Search',
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: 'Mees AI - Academic Search Engine'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mees AI - Academic Search Engine & Research Assistant',
    description: 'Transform your research with our Academic Search Engine. Get AI-powered academic search, citations, and humanized responses. Perfect for students and researchers.',
    creator: '@Iamtoxix',
    site: '@Iamtoxix',
    images: [image],
  },
  alternates: {
    canonical: 'https://www.mees-ai.app',
    languages: {
      'en-US': 'https://www.mees-ai.app'
    }
  },
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code'
    }
  },
  referrer: 'origin-when-cross-origin',
  generator: 'Next.js',
  archives: ['https://www.mees-ai.app/archive'],
  assets: ['https://www.mees-ai.app/assets']
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Mees AI",
              "url": "https://www.mees-ai.app",
              "description": "Advanced AI-powered Academic Search Engine providing smart answers and real-time insights",
              "applicationCategory": "SearchApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Mees AI",
                "url": "https://www.mees-ai.app"
              }
            })
          }}
        />
      </head>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} frontendApi="clerk.mees-ai.app">
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
