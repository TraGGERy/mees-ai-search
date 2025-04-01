import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { type ExtendedCoreMessage } from '@/lib/types'
import { convertToUIMessages } from '@/lib/utils'
import { notFound } from 'next/navigation'

export async function generateMetadata(props: {
  params: { id: string };
}) {
  const { id } = props.params
  const chat = await getChat(id)

  if (!chat) {
    return notFound()
  }

  return {
    title: (chat?.title as string)?.toString().slice(0, 50) || 'Search'
  }
}

export default async function SearchIdPage(props: {
  params: { id: string };
}) {
  const { id } = props.params
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
