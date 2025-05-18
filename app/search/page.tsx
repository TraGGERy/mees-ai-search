import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils/index'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id?: string }>;
  searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  // Check both params and searchParams for the id
  const paramsData = await params
  const searchParamsData = await searchParams
  const id = paramsData?.id || searchParamsData?.id
  
  if (!id) {
    return {
      title: 'New Search | Mees AI',
      description: 'Start a new AI-powered search with Mees AI. Get instant answers and insights from multiple AI models.',
      openGraph: {
        title: 'New Search | Mees AI',
        description: 'Start a new AI-powered search with Mees AI. Get instant answers and insights from multiple AI models.',
        images: [
          {
            url: 'https://mees-ai-search.vercel.app/opengraph-image.png',
            width: 1200,
            height: 630,
            alt: 'Mees AI Search Interface'
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: 'New Search | Mees AI',
        description: 'Start a new AI-powered search with Mees AI. Get instant answers and insights from multiple AI models.',
        images: ['https://mees-ai-search.vercel.app/opengraph-image.png']
      }
    }
  }
  
  const chat = await getChat(id)
  const title = chat?.title?.toString().slice(0, 50) || 'Search'
  const description = `Explore AI-powered search results for "${title}" on Mees AI. Get comprehensive answers and insights.`
  
  return {
    title: `${title} | Mees AI`,
    description,
    openGraph: {
      title: `${title} | Mees AI`,
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
      title: `${title} | Mees AI`,
      description,
      images: ['https://mees-ai-search.vercel.app/opengraph-image.png']
    }
  }
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  // Check both params and searchParams for the id
  const paramsData = await params
  const searchParamsData = await searchParams
  const id = paramsData?.id || searchParamsData?.id
  
  if (!id) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.mees-ai.app/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string",
              "about": {
                "@type": "Thing",
                "name": "Academic Search Engine",
                "description": "AI-powered academic search engine with citations and humanized responses"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": ["Researchers", "Students", "Academics"]
              },
              "educationalUse": "Academic Research and Literature Search",
              "learningResourceType": "Academic Search Engine",
              "interactivityType": "Active",
              "isAccessibleForFree": true,
              "inLanguage": "en-US",
              "featureList": [
                "Academic Search Engine",
                "Citation Generation",
                "Literature Search",
                "Assignment Workflow",
                "Humanized AI Responses",
                "Research Paper Assistance"
              ]
            })
          }}
        />
        <Chat
          id=""
          savedMessages={[]}
          promptType="assignment"
          onPromptTypeChange={null as unknown as (type: string) => void}
        />
      </>
    )
  }
  
  const chat = await getChat(id)
  
  if (!chat) {
    redirect('/not-found')
  }

  const messages = convertToUIMessages(chat.messages || [])
  
  return <Chat
    id={id}
    savedMessages={messages}
    promptType="assignment"
    onPromptTypeChange={null as unknown as (type: string) => void}
  />
}
