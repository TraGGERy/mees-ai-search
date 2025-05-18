import React, { useState } from 'react'
import { CollapsibleMessage } from './collapsible-message'
import { Button } from './ui/button'
import { Pencil, Check, X } from 'lucide-react'
import Textarea from 'react-textarea-autosize'
import { useChat } from 'ai/react'
import { CHAT_ID } from '@/lib/constants'

type UserMessageProps = {
  message: string
  messageId: string
  chatId?: string
}

export const UserMessage: React.FC<UserMessageProps> = ({ message, messageId, chatId }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMessage, setEditedMessage] = useState(message)
  const { setMessages, messages, append } = useChat({
    id: chatId || CHAT_ID
  })

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedMessage(message)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (editedMessage.trim() === message.trim()) {
      setIsEditing(false)
      return
    }

    // Find the current message index
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) {
      setIsEditing(false)
      return
    }

    // Check if there's a response message after this user message
    const hasResponseAfter = 
      messageIndex < messages.length - 1 && 
      messages[messageIndex + 1].role === 'assistant'
    
    // Remove the current message and all subsequent messages (including any response)
    const newMessages = messages.slice(0, messageIndex)
    
    // Update the messages array
    setMessages(newMessages)
    
    // Append the edited message to generate new response
    await append({
      role: 'user',
      content: editedMessage.trim(),
      id: crypto.randomUUID()
    })

    setIsEditing(false)
  }

  return (
    <CollapsibleMessage role="user">
      <div className="flex-1 break-words w-full">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full min-h-[60px] p-2 rounded-md border border-input bg-background resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">{message}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </CollapsibleMessage>
  )
}
