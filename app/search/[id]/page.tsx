import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const maxDuration = 60

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const chat = await getChat(params.id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search',
  }
}

export default async function SearchPage({
  params,
}: {
  params: { id: string }
}) {
  const chat = await getChat(params.id)

  if (!chat) {
    redirect('/')
  }

  const messages = convertToUIMessages(chat.messages || [])
  return <Chat id={params.id} savedMessages={messages} />
}
