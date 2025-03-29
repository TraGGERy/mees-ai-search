import { SearchChat } from '@/components/search-chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const maxDuration = 60

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const chat = await getChat(id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search',
  }
}

export default async function SearchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const chat = await getChat(id)

  if (!chat) {
    redirect('/')
  }

  const messages = convertToUIMessages(chat.messages || [])
  return <SearchChat 
    id={id}
    savedMessages={messages}
    promptType="deepSearch"
  />
}
