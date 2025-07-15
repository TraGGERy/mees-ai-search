import AppSidebar from '@/components/app-sidebar'
import ArtifactRoot from '@/components/artifact/artifact-root'
import Header from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Mees AI - Academic Search Engine | Research Assistant'
const description =
  'Mees AI is an advanced academic search engine and research assistant powered by AI to help with scholarly research, paper analysis, and knowledge discovery.'

export const metadata: Metadata = {
  metadataBase: new URL('https://meea-ai.app'),
  title,
  description,
  keywords: ['academic search engine', 'research assistant', 'AI research tool', 'scholarly search', 'paper analysis', 'academic AI', 'research helper', 'literature review', 'academic writing assistant'],
  manifest: '/manifest.json',
  applicationName: 'Mees AI',
  authors: [{ name: 'Mees AI Team' }],
  generator: 'Next.js',
  category: 'education',
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'en_US',
    url: 'https://meea-ai.app',
    siteName: 'Mees AI',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Mees AI - Academic Search Engine and Research Assistant'
      }
    ]
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@miiura',
    images: ['/opengraph-image.png']
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Mees AI - Academic Search Engine & Research Assistant',
  description: 'Mees AI is an advanced academic search engine and research assistant powered by AI to help with scholarly research, paper analysis, and knowledge discovery.',
  url: 'https://meea-ai.app',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  author: {
    '@type': 'Organization',
    name: 'Mees AI Team'
  }
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  let user = null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = await createClient()
    const {
      data: { user: supabaseUser }
    } = await supabase.auth.getUser()
    user = supabaseUser
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen flex flex-col font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen>
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <Header user={user} />
              <main className="flex flex-1 min-h-0">
                <ArtifactRoot>{children}</ArtifactRoot>
              </main>
            </div>
          </SidebarProvider>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
