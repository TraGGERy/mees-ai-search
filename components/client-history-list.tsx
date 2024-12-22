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
        
        if (isMounted) {
          const uniqueChats = new Map();
          
          data.forEach((chat: any) => {
            if (!uniqueChats.has(chat.chatId)) {
              uniqueChats.set(chat.chatId, {
                id: chat.chatId,
                userId: chat.userId,
                createdAt: chat.createdAt,
                path: `/search/${chat.chatId}`,
                title: chat.title || 'New Chat',
                messages: chat.messages
              });
            }
          });

          setChats(Array.from(uniqueChats.values()));
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

  const handleDelete = async (id: string) => {
    try {
      // Your delete logic...
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete chat'));
    }
  };

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