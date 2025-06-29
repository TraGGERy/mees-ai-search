'use client'

import { CHAT_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PromptType } from '@/lib/utils/prompts'
import { useUser } from '@clerk/nextjs'
import { useChat } from 'ai/react'
import { Message } from 'ai'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { ChatMessages } from './chat-messages'
import { ChatPanel } from './chat-panel'
import { LoginModal } from './login-modal'
import { PricingModal } from './pricing-modal'
import { toast } from 'sonner'

interface ChatProps {
  id: string
  savedMessages: Message[]
  promptType?: "default" | "academic" | "assignment" | "essayPlan" | "researchReport" | "literatureReview" | "caseStudy" | "debatePrep" | "labReport" | "presentationOutline"
  query?: string
  onPromptTypeChange?: (type: string) => void
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryFromParams = searchParams?.get('message') ?? null
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null)
  const { user } = useUser()
  const [promptTypeState, setPromptTypeState] = useState<PromptType>(promptType || 'default')

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
    id: id || CHAT_ID,
    body: {
      id,
      previewToken: searchParams?.get('preview') ?? null,
      ...(queryFromParams && { query: queryFromParams }),
      promptType: promptTypeState
    },
    onFinish: (message) => {
      if (message) {
        setMessages(prev => {
          // Find and replace the message if it exists, otherwise append it
          const index = prev.findIndex(m => m.id === message.id)
          if (index !== -1) {
            const newMessages = [...prev]
            newMessages[index] = message
            return newMessages
          }
          return [...prev, message]
        })
      }
      // Clear loading state after message is received
      setData(undefined)
    },
    onError: (error) => {
      try {
        // First check if the error message is already a string
        if (typeof error.message === 'string') {
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(error.message)
            if (errorData?.requiresLogin) {
              setLoginModalOpen(true)
            } else if (errorData?.needsUpgrade && errorData?.showPricing) {
              if (errorData.remaining !== undefined) {
                setUsageRemaining(errorData.remaining)
              }
              setPricingModalOpen(true)
            } else {
              // If it's a valid JSON but not one of our known error types
              toast.error(errorData.message || 'An error occurred')
            }
          } catch (parseError) {
            // If parsing fails, it's likely a plain text error message
            toast.error(error.message)
          }
        } else {
          // If error.message is not a string, show a generic error
          toast.error('An unexpected error occurred')
        }
      } catch (e) {
        console.error('Error handling error:', e)
        toast.error('An unexpected error occurred')
      }
      // Clear loading state on error
      setData(undefined)
    }
  })

  // Ensure messages are properly initialized
  useEffect(() => {
    if (savedMessages.length > 0) {
      setMessages(savedMessages)
    }
  }, [savedMessages, setMessages])

  // Handle URL updates when messages change
  useEffect(() => {
    if (messages.length > 0 && !id) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.id) {
        const chatId = lastMessage.id.split('-')[0]
        console.log('Updating URL with chat ID:', chatId)
        router.replace(`/search/${chatId}`, { scroll: false })
      }
    }
  }, [messages, id, router])

  const onQuerySelect = useCallback((query: string) => {
    append({
      role: 'user',
      content: query,
      id: crypto.randomUUID()
    })
  }, [append])

  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setData(undefined)
    
    try {
      handleSubmit(e)
    } catch (error) {
      console.error('Error submitting chat:', error)
      toast.error('An error occurred while processing your request. Please try again.')
      setData(undefined)
    }
  }, [handleSubmit, setData])

  const fetchUsageData = useCallback(async () => {
    try {
      const response = await fetch('/api/user/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageRemaining(data.remaining)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchUsageData()
    }
  }, [user, fetchUsageData])

  const handleTypeChange = useCallback((type: string) => {
    // Check if the prompt type requires login (all except 'default' which is 'web')
    if (type !== 'default' && !user) {
      setLoginModalOpen(true)
      // Don't change the prompt type - keep the current one
      return
    }
    
    if (onPromptTypeChange) {
      onPromptTypeChange(type)
    }
    setPromptTypeState(type as PromptType)
  }, [onPromptTypeChange, user])

  return (
    <>
      <div className={cn("flex flex-col w-full max-w-3xl pt-14 pb-60 mx-auto stretch px-4 sm:px-6 lg:px-8", className)}>
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
          onPromptTypeChange={handleTypeChange}
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
