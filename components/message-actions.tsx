'use client'

import { CHAT_ID } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'
import { Copy, Edit, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { ChatShare } from './chat-share'
import { Button } from './ui/button'
import { useUser } from '@clerk/nextjs'
import { SignInButton } from '@clerk/nextjs'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Textarea } from './ui/textarea'

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
  const { isSignedIn } = useUser()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editedMessage, setEditedMessage] = useState(message)
  
  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    toast.success('Message copied to clipboard')
  }

  async function handleEdit() {
    if (!isSignedIn) {
      toast.error('Please sign in to edit messages')
      return
    }
    setEditDialogOpen(true)
  }

  async function handleSaveEdit() {
    if (!messageId) return

    // Find the message index
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    // Create new messages array with edited message
    const newMessages = [...messages]
    newMessages[messageIndex] = {
      ...newMessages[messageIndex],
      content: editedMessage
    }
    setMessages(newMessages)

    // If this is a user message, regenerate the response
    if (newMessages[messageIndex].role === 'user') {
      // Remove all messages after this one
      const messagesToKeep = newMessages.slice(0, messageIndex + 1)
      setMessages(messagesToKeep)

      // Regenerate the response
      await append({
        role: 'user',
        content: editedMessage,
        id: crypto.randomUUID()
      })

      toast.success('Regenerating response...')
    } else {
      toast.success('Message updated')
    }

    setEditDialogOpen(false)
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
  
  function handleFeedback(type: 'like' | 'dislike') {
    if (!isSignedIn) {
      toast.error('Please sign in to provide feedback')
      return
    }
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
      {isSignedIn ? (
        <>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="rounded-full"
                title="Edit message"
              >
                <Edit size={14} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Message</DialogTitle>
                <DialogDescription>
                  Make changes to your message. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleSaveEdit}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRegenerate}
            className="rounded-full"
            title="Regenerate response"
          >
            <RefreshCw size={14} />
          </Button>
        </>
      ) : (
        <>
          <SignInButton mode="modal">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title="Sign in to edit messages"
            >
              <Edit size={14} />
            </Button>
          </SignInButton>
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
        </>
      )}
      {enableShare && chatId && <ChatShare chatId={chatId} />}
      {showFeedback && (
        <>
          {isSignedIn ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => handleFeedback('like')}>
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleFeedback('dislike')}>
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="icon">
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button variant="ghost" size="icon">
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </SignInButton>
            </>
          )}
        </>
      )}
    </div>
  )
}
