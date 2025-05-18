import { JSONValue, Message } from 'ai'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { RenderMessage } from './render-message'
import { ToolSection } from './tool-section'
import { Spinner } from './ui/spinner'

interface ChatMessagesProps {
  messages: Message[]
  data: JSONValue[] | undefined
  onQuerySelect: (query: string) => void
  isLoading: boolean
  chatId?: string
}

export function ChatMessages({
  messages,
  data,
  onQuerySelect,
  isLoading,
  chatId
}: ChatMessagesProps) {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({})
  const manualToolCallId = 'manual-tool-call'

  // Add ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom function with debounce
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      const behavior = messages.length > 10 ? 'smooth' : 'instant'
      messagesEndRef.current.scrollIntoView({ behavior })
    }
  }, [messages.length])

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages, scrollToBottom])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'user') {
      setOpenStates({ [manualToolCallId]: true })
    }
  }, [messages])

  // Memoize the last tool data calculation
  const lastToolData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null

    const lastItem = data[data.length - 1]
    if (!lastItem || lastItem.type !== 'tool_call') return null

    const toolData = lastItem.data
    return {
      state: 'call' as const,
      toolCallId: toolData.toolCallId,
      toolName: toolData.toolName,
      args: toolData.args ? JSON.parse(toolData.args) : undefined
    }
  }, [data])

  // Memoize the last user index calculation
  const lastUserIndex = useMemo(() => {
    if (!messages.length) return -1
    return messages.length - 1 - [...messages].reverse().findIndex(msg => msg.role === 'user')
  }, [messages])

  const showLoading = isLoading && messages[messages.length - 1]?.role === 'user'

  // Memoize the isOpen calculation
  const getIsOpen = useCallback((id: string) => {
    const baseId = id.endsWith('-related') ? id.slice(0, -8) : id
    const index = messages.findIndex(msg => msg.id === baseId)
    return openStates[id] ?? index >= lastUserIndex
  }, [messages, lastUserIndex, openStates])

  const handleOpenChange = (id: string, open: boolean) => {
    setOpenStates(prev => ({
      ...prev,
      [id]: open
    }))
  }

  if (!messages.length) return null

  return (
    <div className="relative mx-auto px-4 w-full">
      {messages.map(message => (
        <div key={message.id} className="mb-4 flex flex-col gap-4">
          <RenderMessage
            message={message}
            messageId={message.id}
            getIsOpen={getIsOpen}
            onOpenChange={handleOpenChange}
            onQuerySelect={onQuerySelect}
            chatId={chatId}
          />
        </div>
      ))}
      {showLoading &&
        (lastToolData ? (
          <ToolSection
            key={manualToolCallId}
            tool={lastToolData}
            isOpen={getIsOpen(manualToolCallId)}
            onOpenChange={open => handleOpenChange(manualToolCallId, open)}
          />
        ) : (
          <Spinner />
        ))}
      <div ref={messagesEndRef} /> {/* Add empty div as scroll anchor */}
    </div>
  )
}
