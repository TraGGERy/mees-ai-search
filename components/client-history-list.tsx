// components/client-history-list.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';

export function ClientHistoryList() {
  const { user } = useUser();
  // Simple data fetcher
  const fetcher = (url: string) => fetch(url).then(r => r.json());

  // Only fetch when user is available
  const { data, error, isLoading } = useSWR(
    user ? `/api/user-chat-history?userId=${user.id}` : null,
    fetcher
  );

  if (!user) {
    return <div>Please sign in to see your chat history.</div>;
  }

  if (error) {
    return <div>Error loading chat history.</div>;
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading chat history...</div>;
  }

  // If no chats
  if (!data || data.length === 0) {
    return <div>No chats yet.</div>;
  }

  return (
    <div className="space-y-2">
      {data.map((chat: any) => (
        <Link
          key={chat.chatId}
          href={`/search/${chat.chatId}`}
          className="block text-white-600 hover:underline"
        >
          {chat.title || 'Untitled Chat'}
        </Link>
      ))}
    </div>
  );
}