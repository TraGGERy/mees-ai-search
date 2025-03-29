"use client"

import { Chat } from '@/components/chat'
import { PromptType } from '@/lib/utils/prompts'
import { generateId } from 'ai'
import { Suspense, useState } from 'react'

function ChatWrapper() {
  // Generate a unique ID for the chat
  const chatId = generateId()
  const [promptType, setPromptType] = useState<PromptType>('default')

  return (
    <Chat 
      id={chatId}
      savedMessages={[]}
      promptType={promptType}
      onPromptTypeChange={setPromptType}
    />
  )
}

export default function IndexPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 font-medium">Loading...</p>
      </div>
    }>
      <ChatWrapper />
    </Suspense>
  )
}
