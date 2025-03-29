import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const chat = await getChat(id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search',
  }
}

export default async function SearchPage(props: PageProps) {
  const { id } = await props.params
  const chat = await getChat(id)
  
  if (!chat) {
    redirect('/not-found')
  }

  const messages = convertToUIMessages(chat.messages || [])
  
  return <Chat
    id={id}
    savedMessages={messages}
    promptType="deepSearch"
  />
}
