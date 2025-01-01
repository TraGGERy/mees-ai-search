import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Chat } from '@/components/chat'
import { getChat, getChatNeon } from '@/lib/actions/chat'
import { AI } from '@/app/actions'
import ChatSkeleton from '@/components/chat-skeleton'

interface SearchPageProps {
  params: {
    id: string
  }
}

export default function SearchPage({ params }: SearchPageProps) {
  // You don’t need to do data fetching here in the top-level
  // since we can do it within a nested component and wrap in <Suspense>.
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatWrapper chatId={params.id} />
    </Suspense>
  )
}

async function ChatWrapper({ chatId }: { chatId: string }) {
  // 1. Attempt to fetch from Redis
  let chat = await getChat(chatId, 'anonymous')

  // 2. If not found in Redis, try Neon
  if (!chat) {
    chat = await getChatNeon(chatId)
  }

  // 3. If truly not found, call notFound
  if (!chat) {
    return notFound()
  }

  // Optional: Additional checks (like user permissions)
  // if (chat.userId !== currentUser) {
  //   return notFound()
  // }

  return (
    <AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
      <Chat id={chatId} />
    </AI>
  )
}
