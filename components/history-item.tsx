'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chat } from '@/lib/types';
import { cn } from '@/lib/utils';

type HistoryItemProps = {
  chat: Chat;
};

const formatDateWithTime = (date: Date | string) => {
  const parsedDate = new Date(date);
  const now = new Date();
  const yesterday = new Date();
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
        'flex flex-col p-2 rounded border hover:bg-muted cursor-pointer',
        isActive ? 'bg-muted/70 border-border' : 'border-transparent'
      )}
    >
      <div className="text-xs font-medium truncate">{chat.title}</div>
      <div className="text-xs text-muted-foreground">{formatDateWithTime(chat.createdAt)}</div>
    </Link>
  );
};

export default HistoryItem;
