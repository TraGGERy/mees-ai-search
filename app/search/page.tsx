import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
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
      title: 'New Search',
    }
  }
  
  const chat = await getChat(id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search',
  }
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  // Check both params and searchParams for the id
  const paramsData = await params
  const searchParamsData = await searchParams
  const id = paramsData?.id || searchParamsData?.id
  
  if (!id) {
    // For a new search without history
    return <Chat
      id=""
      savedMessages={[]}
      promptType="deepSearch"
      onPromptTypeChange={null as unknown as (type: string) => void}
    />
  }
  
  const chat = await getChat(id)
  
  if (!chat) {
    redirect('/not-found')
  }

  const messages = convertToUIMessages(chat.messages || [])
  
  return <Chat
    id={id}
    savedMessages={messages}
    promptType="deepSearch"
    onPromptTypeChange={null as unknown as (type: string) => void}
  />
}
