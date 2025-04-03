'use client'

import { CHAT_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'
import { Copy, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ChatShare } from './chat-share'
import { Button } from './ui/button'
import { useUser } from '@clerk/nextjs'
import { SignInButton } from '@clerk/nextjs'

export type MessageActionsProps = {
  message: string
  chatId?: string
  enableShare?: boolean
  messageId?: string
}

export function MessageActions({
  message,
  chatId,
  enableShare = false,
  messageId
}: MessageActionsProps) {
  const { isLoading, messages, setMessages, append } = useChat({
    id: CHAT_ID
  })
  const { isSignedIn } = useUser()
  
  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    toast.success('Message copied to clipboard')
  }

  async function handleRegenerate() {
    if (!isSignedIn) {
      toast.error('Please sign in to regenerate responses')
      return
    }

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

  if (isLoading) {
    return <div className="size-10" />
  }

  return (
    <div className="flex items-center gap-0.5 self-end">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="rounded-full"
      >
        <Copy size={14} />
      </Button>
      {isSignedIn ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRegenerate}
          className="rounded-full"
          title="Regenerate response"
        >
          <RefreshCw size={14} />
        </Button>
      ) : (
        <SignInButton mode="modal">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            title="Sign in to regenerate responses"
          >
            <RefreshCw size={14} />
          </Button>
        </SignInButton>
      )}
      {enableShare && chatId && <ChatShare chatId={chatId} />}
    </div>
  )
}
