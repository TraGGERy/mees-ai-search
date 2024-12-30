// components/client-history-list.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface ChatHistory {
  id: string;
  title: string;
  path: string;
  createdAt: string;
  userId: string;
}

export function ClientHistoryList() {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoaded, user } = useUser();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userId = isLoaded && user ? user.id : 'anonymous';
        const response = await fetch('/api/search/history');
        if (!response.ok) throw new Error('Failed to fetch chat history');
        const data = await response.json();
        
        // Filter chats for current user or anonymous
        const userChats = data.filter((chat: ChatHistory) => 
          chat.userId === userId
        );
        setChats(userChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
    const intervalId = setInterval(fetchChats, 30000);
    return () => clearInterval(intervalId);
  }, [isLoaded, user]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
        No chat history
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={chat.path}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate dark:text-gray-200">
              {chat.title || 'New Chat'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(chat.createdAt), 'MMM d, h:mm a')}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}