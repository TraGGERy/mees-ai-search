import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { type ExtendedCoreMessage } from '@/lib/types'
import { convertToUIMessages } from '@/lib/utils'
import { notFound } from 'next/navigation'

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

  return {
    title: (chat?.title as string)?.toString().slice(0, 50) || 'Search'
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

  return <Chat
    id={id}
    savedMessages={messages}
    promptType="deepSearch"
    onPromptTypeChange={null as unknown as (type: string) => void}
  />
}
