'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

interface HistoryItemProps {
  chat: Chat;
}

const formatDateWithTime = (date: Date | string) => {
  const parsedDate = new Date(date);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(parsedDate, now)) {
    return `Today, ${parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isSameDay(parsedDate, yesterday)) {
    return `Yesterday, ${parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return parsedDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const HistoryItem: React.FC<HistoryItemProps> = ({ chat }) => {
  const pathname = usePathname();
  const isActive = pathname === chat.path;

  return (
    <Link
      href={chat.path}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors',
        isActive && 'bg-muted/50'
      )}
    >
      <MessageSquare className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {chat.title || 'New Chat'}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDateWithTime(chat.createdAt)}
        </div>
      </div>
    </Link>
  );
};

export default HistoryItem;
