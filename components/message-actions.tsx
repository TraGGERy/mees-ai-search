'use client'

import { CHAT_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'
import { Copy, ThumbsDown, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { ChatShare } from './chat-share'
import { Button } from './ui/button'

export type MessageActionsProps = {
  message: string
  chatId?: string
  enableShare?: boolean
  showFeedback?: boolean
}

export function MessageActions({
  message,
  chatId,
  enableShare = false,
  showFeedback = false
}: MessageActionsProps) {
  const { isLoading } = useChat({
    id: CHAT_ID
  })
  
  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    toast.success('Message copied to clipboard')
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
