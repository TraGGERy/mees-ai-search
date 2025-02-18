import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const maxDuration = 60

export const dynamic = 'force-dynamic'

  // Changed interface name to avoid conflict with generated types
interface SearchPageParams {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SearchPageParams): Promise<Metadata> {
  const { id } = params
  const chat = await getChat(id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search'
  }
}

export default async function SearchPage({ params }: SearchPageParams) {
  const { id } = params
  const chat = await getChat(id)

  if (!chat) {
    console.log(`Chat not found, redirecting from ID: ${id}`)
    redirect('/')
  }

  // Convert messages for the chat component
  const messages = convertToUIMessages(chat.messages || [])

  return <Chat id={id} savedMessages={messages} />
}
