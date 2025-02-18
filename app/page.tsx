import { Chat } from '@/components/chat'
import { CHAT_ID } from '@/lib/constants'
import { Suspense } from 'react'

function ChatWrapper() {
  return (
    <Chat 
      id={CHAT_ID} 
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
