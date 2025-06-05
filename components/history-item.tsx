'use client'

import { Chat } from '@/lib/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { memo, useMemo } from 'react'
import { X } from 'lucide-react'

type HistoryItemProps = {
  chat: Chat
  onDelete?: (id: string) => void
}

// Memoized date formatter for better performance
const formatDateWithTime = (date: Date | string) => {
  const parsedDate = new Date(date)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (
    parsedDate.getDate() === now.getDate() &&
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getFullYear() === now.getFullYear()
  ) {
    return `Today, ${formatTime(parsedDate)}`
  } else if (
    parsedDate.getDate() === yesterday.getDate() &&
    parsedDate.getMonth() === yesterday.getMonth() &&
    parsedDate.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday, ${formatTime(parsedDate)}`
  } else {
    return parsedDate.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
}

const HistoryItem: React.FC<HistoryItemProps> = memo(({ chat, onDelete }) => {
  const pathname = usePathname()
  const isActive = pathname === chat.path
  
  // Memoize the formatted date to prevent recalculation on re-renders
  const formattedDate = useMemo(() => formatDateWithTime(chat.createdAt), [chat.createdAt])

  return (
    <div className={cn(
      'relative group flex flex-col hover:bg-muted cursor-pointer p-2 rounded border transition-colors',
      isActive ? 'bg-muted/70 border-border' : 'border-transparent'
    )}>
      <Link
        href={chat.path}
        prefetch={false}
        className="flex-1 min-w-0"
      >
        <div className="text-xs font-medium truncate select-none">
          {chat.title}
        </div>
        <div className="text-xs text-muted-foreground">
          {formattedDate}
        </div>
      </Link>
      {onDelete && (
        <button
          type="button"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(chat.id)
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
          title="Delete"
        >
          <X className="w-3.5 h-3.5 text-red-500" />
        </button>
      )}
    </div>
  )
})

HistoryItem.displayName = 'HistoryItem'

export default HistoryItem
