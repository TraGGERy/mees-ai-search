import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type SearchParams = {
  id?: string;
}

export async function generateMetadata(props: {
  params: Promise<{ id?: string }>;
  searchParams?: SearchParams;
}): Promise<Metadata> {
  // Check both params and searchParams for the id
  const params = await props.params
  const id = params?.id || props.searchParams?.id
  
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

export default async function SearchPage(props: {
  params: Promise<{ id?: string }>;
  searchParams?: SearchParams;
}) {
  // Check both params and searchParams for the id
  const params = await props.params
  const id = params?.id || props.searchParams?.id
  
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
