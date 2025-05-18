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
  // Ensure we're using the proper chatId, defaulting to CHAT_ID if not provided
  const chatIdToUse = chatId || CHAT_ID
  
  const { isLoading, messages, setMessages, append } = useChat({
    id: chatIdToUse
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

    if (!messageId) {
      toast.error('Cannot regenerate - missing message ID')
      return
    }

    // Find the current message in the conversation
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) {
      console.error('Message not found in history:', messageId)
      toast.error('Message not found in chat history')
      return
    }

    // Find the most recent user message before this response
    let userMessageIndex = -1
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessageIndex = i
        break
      }
    }

    if (userMessageIndex === -1) {
      toast.error('Could not find the user message')
      return
    }

    // Get user message content but create a new object with a new ID
    const userMessageContent = messages[userMessageIndex].content
    
    // Store original messages in case we need to restore
    const originalMessages = [...messages]
    
    try {
      // Show a loading toast
      toast.loading('Regenerating response...')
      
      // Trim the messages to remove the current response and any after it
    const newMessages = messages.slice(0, messageIndex)
    setMessages(newMessages)

      // Create a new message using the format expected by the AI SDK
      setTimeout(async () => {
        try {
          // Create a simpler message object that the AI SDK expects
          // This avoids potential issues with incompatible message formats
    await append({
      role: 'user',
            content: userMessageContent
            // Don't specify an ID - let the SDK generate one automatically
          })
          toast.dismiss()
          toast.success('New response generated')
        } catch (err) {
          console.error('Inner error generating response:', err)
          toast.dismiss()
          toast.error('Failed to generate new response')
          setMessages(originalMessages)
        }
      }, 100)
    } catch (error) {
      console.error('Error in regeneration process:', error)
      toast.dismiss()
      toast.error('Regeneration failed')
      // Restore original messages
      setMessages(originalMessages)
    }
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
