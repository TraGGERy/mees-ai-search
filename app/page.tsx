import { Chat } from '@/components/chat'
import { generateId } from 'ai'
import { Suspense } from 'react'

function ChatWrapper() {
  // Generate a unique ID for the chat
  const chatId = generateId()
  return (
    <Chat 
      id={chatId}
      savedMessages={[]}
    />
  )
}

export default function IndexPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatWrapper />
    </Suspense>
  )
}
