'use client'

import { CHAT_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'
import { Copy, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { ChatShare } from './chat-share'
import { Button } from './ui/button'

export type MessageActionsProps = {
  message: string
  chatId?: string
  enableShare?: boolean
  showFeedback?: boolean
  messageId?: string
}

export function MessageActions({
  message,
  chatId,
  enableShare = false,
  showFeedback = false,
  messageId
}: MessageActionsProps) {
  const { isLoading, messages, setMessages, append } = useChat({
    id: CHAT_ID
  })
  
  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    toast.success('Message copied to clipboard')
  }

  async function handleRegenerate() {
    if (!messageId) return

    // Find the user message that triggered this response
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    // Get the user message that triggered this response
    const userMessage = messages[messageIndex - 1]
    if (!userMessage || userMessage.role !== 'user') return

    // Remove the current response
    const newMessages = messages.slice(0, messageIndex)
    setMessages(newMessages)

    // Regenerate the response
    await append({
      role: 'user',
      content: userMessage.content,
      id: crypto.randomUUID()
    })

    toast.success('Regenerating response...')
  }
  
  function handleFeedback(type: 'like' | 'dislike') {
    // Implement feedback handling logic here
    toast.success(`Feedback submitted: ${type}`)
    // You could send this to your API, e.g.:
    // fetch('/api/feedback', { method: 'POST', body: JSON.stringify({ type, messageId: chatId }) })
  }

  if (isLoading) {
    return <div className="size-10" />
  }

  return (
    <div className={cn('flex items-center gap-0.5 self-end', showFeedback && 'gap-2')}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="rounded-full"
      >
        <Copy size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRegenerate}
        className="rounded-full"
        title="Regenerate response"
      >
        <RefreshCw size={14} />
      </Button>
      {enableShare && chatId && <ChatShare chatId={chatId} />}
      {showFeedback && (
        <>
          <Button variant="ghost" size="icon" onClick={() => handleFeedback('like')}>
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleFeedback('dislike')}>
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}
