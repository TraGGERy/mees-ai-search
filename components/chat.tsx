'use client'

import { CHAT_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PromptType } from '@/lib/utils/prompts'
import { useUser } from '@clerk/nextjs'
import { Message, useChat } from 'ai/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'
import { LoginModal } from './login-modal'
import { PricingModal } from './pricing-modal'
import { PromptSelector } from './prompt-selector'

interface ChatProps {
  id: string
  savedMessages?: Message[]
  query?: string
  promptType: PromptType
  onPromptTypeChange: (type: PromptType) => void
  className?: string
}

export function Chat({
  id,
  savedMessages = [],
  query,
  promptType,
  onPromptTypeChange,
  className
}: ChatProps) {
  const searchParams = useSearchParams()
  const queryFromParams = searchParams?.get('message') ?? null
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null)
  const { user } = useUser()
  const [promptTypeState, setPromptTypeState] = useState<PromptType>('default')

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    stop,
    append,
    data,
    setData,
    reload
  } = useChat({
    initialMessages: savedMessages,
    id: CHAT_ID,
    body: {
      id,
      previewToken: searchParams?.get('preview') ?? null,
      ...(queryFromParams && { query: queryFromParams }),
      promptType: promptTypeState
    },
    onFinish: () => {
      window.history.replaceState({}, '', `/search/${id}`)
    },
    onError: (error) => {
      try {
        const errorData = error.message && JSON.parse(error.message)
        if (errorData?.requiresLogin) {
          setLoginModalOpen(true)
        } else if (errorData?.needsUpgrade && errorData?.showPricing) {
          if (errorData.remaining !== undefined) {
            setUsageRemaining(errorData.remaining)
          }
          setPricingModalOpen(true)
        }
      } catch (e) {
        console.error('Error parsing error message:', e)
      }
    }
  })

  useEffect(() => {
    setMessages(savedMessages)
  }, [id, setMessages, savedMessages])

  const onQuerySelect = (query: string) => {
    append({
      role: 'user',
      content: query
    })
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setData(undefined)
    handleSubmit(e)
  }

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/user/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageRemaining(data.remaining)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUsageData()
    }
  }, [user])

  useEffect(() => {
    console.log('promptType state changed to:', promptTypeState)
  }, [promptTypeState])

  return (
    <>
      <div className={cn("flex flex-col w-full max-w-3xl pt-14 pb-60 mx-auto stretch", className)}>
        <ChatMessages
          messages={messages}
          data={data}
          onQuerySelect={onQuerySelect}
          isLoading={isLoading}
          chatId={id}
        />
        <ChatPanel
          id={id}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={onSubmit}
          isLoading={isLoading}
          messages={messages}
          setMessages={setMessages}
          stop={stop}
          query={queryFromParams ?? undefined}
          append={append}
          reload={reload}
          promptType={promptTypeState}
          onPromptTypeChange={(type) => {
            console.log('PromptSelector changed to:', type)
            setPromptTypeState(type)
          }}
        />
        
      </div>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
      
      <PricingModal 
        isOpen={pricingModalOpen} 
        onClose={() => setPricingModalOpen(false)}
        onSelectFree={() => {}}
        remaining={usageRemaining || 0}
      />
    </>
  )
}
