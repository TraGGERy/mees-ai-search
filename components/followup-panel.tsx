'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/app/actions'
import { UserMessage } from './user-message'
import { ArrowRight } from 'lucide-react'
import { useAppState } from '@/lib/utils/app-state'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { models } from '@/lib/types/models'
import { getDefaultModelId } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import { SignInButton } from '@clerk/nextjs'
import { LoginToast } from './ui/toast'

export function FollowupPanel() {
  const [input, setInput] = useState('')
  const [followupCount, setFollowupCount] = useLocalStorage<number>('followupCount', 0)
  const { isSignedIn } = useAuth()
  const { submit } = useActions()
  const [, setMessages] = useUIState<typeof AI>()
  const { isGenerating, setIsGenerating } = useAppState()
  const [showLoginToast, setShowLoginToast] = useState(false)

  const [selectedModelId] = useLocalStorage<string>(
    'selectedModel',
    getDefaultModelId(models)
  )

  useEffect(() => {
    if (isSignedIn) {
      setFollowupCount(0)
    }
  }, [isSignedIn, setFollowupCount])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isGenerating) return

    if (hasReachedLimit) {
      setShowLoginToast(true)
      return
    }

    setIsGenerating(true)
    setInput('')
    
    // Increment counter only for non-authenticated users
    if (!isSignedIn) {
      setFollowupCount(followupCount + 1)
    }

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    formData.set('model', selectedModelId)

    const userMessage = {
      id: Date.now(),
      isGenerating: false,
      component: <UserMessage message={input} />
    }

    const responseMessage = await submit(formData)
    setMessages(currentMessages => [
      ...currentMessages,
      userMessage,
      responseMessage
    ])
  }

  const remainingQuestions = 3 - followupCount
  const hasReachedLimit = !isSignedIn && followupCount >= 3

  return (
    <>
      {showLoginToast && (
        <LoginToast
          message="You've reached the limit for follow-up questions. Sign in to continue asking questions."
          onClose={() => setShowLoginToast(false)}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center p-4 shadow-lg backdrop-blur-md bg-opacity-70 bg-inherit"
      >
        {hasReachedLimit && (
          <div className="mb-4 text-center">
            <p className="mb-2 text-sm text-purple-600 dark:text-purple-300">
              You have reached the limit for follow-up questions
            </p>
            <SignInButton mode="modal">
              <Button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Sign in to continue
              </Button>
            </SignInButton>
          </div>
        )}
        <div className="w-full max-w-3xl mx-auto relative">
          <Input
            type="text"
            name="input"
            placeholder={hasReachedLimit 
              ? "Sign in to ask more questions..." 
              : "Ask a follow-up question..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={hasReachedLimit}
            className="w-full h-12 pl-4 pr-16 text-inherit placeholder-gray-400 bg-gray-200 dark:bg-gray-700 bg-opacity-50 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-opacity-70 transition-all duration-300"
          />
          <Button
            type="submit"
            disabled={input.length === 0 || isGenerating || hasReachedLimit}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 flex items-center justify-center text-white bg-purple-600 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ArrowRight size={20} />
          </Button>
        </div>
        {!isSignedIn && followupCount > 0 && followupCount < 3 && (
          <div className="mt-2 text-xs text-gray-500">
            {remainingQuestions} follow-up question{remainingQuestions !== 1 ? 's' : ''} remaining
          </div>
        )}
      </form>
    </>
  )
}

