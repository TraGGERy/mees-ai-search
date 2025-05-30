'use client'

import { CHAT_ID } from '@/lib/constants'
import { Message, useChat } from 'ai/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'
import { LoginModal } from './login-modal'
import { PricingModal } from './pricing-modal'

export function Chat({
  id,
  savedMessages = [],
  query
}: {
  id: string
  savedMessages?: Message[]
  query?: string
}) {
  const searchParams = useSearchParams()
  const queryFromParams = searchParams.get('message')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [pricingModalOpen, setPricingModalOpen] = useState(false)

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
      previewToken: searchParams.get('preview'),
      ...(queryFromParams && { query: queryFromParams })
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
          setPricingModalOpen(true)
        }
      } catch (e) {
        console.error('Error parsing error message:', e)
      }
    }
  })

  useEffect(() => {
    setMessages(savedMessages)
  }, [id])

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

  return (
    <>
      <div className="flex flex-col w-full max-w-3xl pt-14 pb-60 mx-auto stretch">
        <ChatMessages
          messages={messages}
          data={data}
          onQuerySelect={onQuerySelect}
          isLoading={isLoading}
          chatId={id}
        />
        <ChatPanel
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
        />
      </div>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
      
      <PricingModal 
        isOpen={pricingModalOpen} 
        onClose={() => setPricingModalOpen(false)} 
      />
    </>
  )
}
