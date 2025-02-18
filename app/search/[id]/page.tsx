import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const maxDuration = 60

export const dynamic = 'force-dynamic'

export async function generateMetadata(
  props: {
    params: Promise<{ id: string }>
  }
): Promise<Metadata> {
  const params = await props.params;
  const chat = await getChat(params.id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search',
  }
}

export default async function SearchPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  const chat = await getChat(params.id)

  if (!chat) {
    redirect('/')
  }

  const messages = convertToUIMessages(chat.messages || [])
  return <Chat id={params.id} savedMessages={messages} />
}
