import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { type ExtendedCoreMessage } from '@/lib/types'
import { convertToUIMessages } from '@/lib/utils/index'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{}>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const chat = await getChat(id)

  if (!chat) {
    return notFound()
  }

  const title = (chat?.title as string)?.toString().slice(0, 50) || 'Search'
  const description = `Explore detailed AI-powered search results for "${title}" on Mees AI. Get comprehensive answers, insights, and related information.`

  return {
    title: `${title} | Mees AI Search Results`,
    description,
    openGraph: {
      title: `${title} | Mees AI Search Results`,
      description,
      images: [
        {
          url: 'https://mees-ai-search.vercel.app/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: `Mees AI Search Results for ${title}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Mees AI Search Results`,
      description,
      images: ['https://mees-ai-search.vercel.app/opengraph-image.png']
    },
    alternates: {
      canonical: `https://www.mees-ai.app/search/${id}`,
      languages: {
        'en-US': `https://www.mees-ai.app/search/${id}`
      }
    }
}

export default async function SearchIdPage({ params }: PageProps) {
  const { id } = await params
  const chat = await getChat(id)
  
  // convertToUIMessages for useChat hook
  const messages = convertToUIMessages((chat?.messages || []) as ExtendedCoreMessage[])

  if (!chat) {
    notFound()
  }

  const title = (chat?.title as string)?.toString().slice(0, 50) || 'Search'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "name": title,
            "url": `https://www.mees-ai.app/search/${id}`,
            "description": `Academic Search Engine results for "${title}" - Get citation-ready answers and humanized AI responses`,
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.mees-ai.app"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Academic Search",
                  "item": "https://www.mees-ai.app/search"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": title,
                  "item": `https://www.mees-ai.app/search/${id}`
                }
              ]
            },
            "about": {
              "@type": "Thing",
              "name": "Academic Search Engine",
              "description": "Academic research and literature search with citations"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": ["Researchers", "Students", "Academics"]
            },
            "educationalUse": "Academic Research and Literature Search",
            "learningResourceType": "Academic Search Engine",
            "interactivityType": "Active",
            "isAccessibleForFree": true,
            "inLanguage": "en-US"
          })
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-700">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/search" className="hover:text-gray-700">Search</Link>
          </li>
          <li>/</li>
          <li className="text-gray-700">{title}</li>
        </ol>
      </nav>
      <Chat
        id={id}
        savedMessages={messages}
        promptType="assignment"
        onPromptTypeChange={null as unknown as (type: string) => void}
      />
    </>
  )
}
