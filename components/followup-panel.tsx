'use client'

import { useState } from 'react'
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

export function FollowupPanel() {
  const [input, setInput] = useState('')
  const { submit } = useActions()
  const [, setMessages] = useUIState<typeof AI>()
  const { isGenerating, setIsGenerating } = useAppState()

  const [selectedModelId] = useLocalStorage<string>(
    'selectedModel',
    getDefaultModelId(models)
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isGenerating) return

    setIsGenerating(true)
    setInput('')

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

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center p-4 shadow-lg backdrop-blur-md bg-opacity-70 bg-inherit"
    >
      <div className="w-full max-w-3xl mx-auto flex items-center space-x-2">
        <Input
          type="text"
          name="input"
          placeholder="Ask a follow-up question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 h-12 px-4 text-inherit placeholder-gray-400 bg-gray-200 dark:bg-gray-700 bg-opacity-50 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-opacity-70 transition-all duration-300"
        />
        <Button
          type="submit"
          disabled={input.length === 0 || isGenerating}
          className="h-12 px-6 text-white bg-purple-600 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ArrowRight size={20} />
        </Button>
      </div>
    </form>
  )
}

