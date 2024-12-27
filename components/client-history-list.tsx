// components/client-history-list.tsx
'use client';

import React, { useEffect, useState } from 'react';
import HistoryItem from './history-item';
import { Chat } from '@/lib/types';
import { useUser } from '@clerk/nextjs';

export function ClientHistoryList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isLoaded, user } = useUser();
  
  // Assume searchChatId is obtained from somewhere, e.g., props or context
  const searchChatId = '/search/someChatId'; // Replace with actual logic to get the search chat ID

  useEffect(() => {
    let isMounted = true;

    const fetchChats = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch('/api/loader/chat');
        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }
        
        const data = await response.json();

        // Verify the structure of the data
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from the server');
        }

        if (isMounted) {
          const uniqueChats = new Map();

          data.forEach((chat: any) => {
            // Verify each chat object structure
            if (chat.chatId && chat.userId && chat.createdAt) {
              uniqueChats.set(chat.chatId, {
                id: chat.chatId,
                userId: chat.userId,
                createdAt: chat.createdAt,
                path: `/search/${chat.chatId}`,
                title: chat.title || 'New Chat',
                messages: chat.messages
              });
            } else {
              console.warn('Chat object is missing required fields:', chat);
            }
          });

          // Filter out chats that do not match the searchChatId based on the path
          const filteredChats = Array.from(uniqueChats.values()).filter(chat => chat.path === searchChatId);

          setChats(filteredChats);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching chats:', error);
          setError(error instanceof Error ? error : new Error('Failed to load chat history'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchChats();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, user]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h2>Error loading chat history</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {!chats.length ? (
        <div className="text-gray-500 text-sm text-start py-6">
          <div>No chat history</div>
        </div>
      ) : (
        chats.map((chat: Chat) => (
          <HistoryItem key={chat.id} chat={chat} />
        ))
      )}
    </div>
  );
}