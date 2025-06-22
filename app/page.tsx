"use client"

import { Chat } from '@/components/chat'
import { SplashScreen } from '@/components/splash-screen'
import { PromptType } from '@/lib/utils/prompts'
import { generateId } from 'ai'
import { Suspense, useState } from 'react'

function ChatWrapper() {
  // Generate a unique ID for the chat
  const chatId = generateId()
  const [promptType, setPromptType] = useState<PromptType>('default')

  const handlePromptTypeChange = (type: PromptType) => {
    setPromptType(type);
  }

  return (
    <Chat 
      id={chatId}
      savedMessages={[]}
      promptType={promptType}
      onPromptTypeChange={(type: string) => handlePromptTypeChange(type as PromptType)}
    />
  )
}

export default function IndexPage() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <ChatWrapper />
    </Suspense>
  )
}
