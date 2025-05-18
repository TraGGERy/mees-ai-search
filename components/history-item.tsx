'use client'

import { Chat } from '@/lib/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { memo, useMemo } from 'react'

type HistoryItemProps = {
  chat: Chat
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

const HistoryItem: React.FC<HistoryItemProps> = memo(({ chat }) => {
  const pathname = usePathname()
  const isActive = pathname === chat.path
  
  // Memoize the formatted date to prevent recalculation on re-renders
  const formattedDate = useMemo(() => formatDateWithTime(chat.createdAt), [chat.createdAt])

  return (
    <Link
      href={chat.path}
      prefetch={false} // Only prefetch when hovered
      className={cn(
        'flex flex-col hover:bg-muted cursor-pointer p-2 rounded border transition-colors',
        isActive ? 'bg-muted/70 border-border' : 'border-transparent'
      )}
    >
      <div className="text-xs font-medium truncate select-none">
        {chat.title}
      </div>
      <div className="text-xs text-muted-foreground">
        {formattedDate}
      </div>
    </Link>
  )
})

HistoryItem.displayName = 'HistoryItem'

export default HistoryItem
