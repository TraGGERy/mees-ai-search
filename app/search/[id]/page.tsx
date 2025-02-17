import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
import { redirect } from 'next/navigation'

export const maxDuration = 60

export async function generateMetadata(props: {
  params: { id: string }
}) {
  const { id } = props.params
  const chat = await getChat(id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search'
  }
}

export default async function SearchPage(props: {
  params: { id: string }
}) {
  const { id } = props.params
  const chat = await getChat(id)

  if (!chat) {
    console.log(`Chat not found, redirecting from ID: ${id}`)
    redirect('/')
  }

  // Convert messages for the chat component
  const messages = convertToUIMessages(chat.messages || [])

  return <Chat id={id} savedMessages={messages} />
}
