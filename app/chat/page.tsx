"use client";

import { useChat } from "ai/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bot, Send, User, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { format } from "date-fns";
import { Toaster } from "sonner";
import { useUser } from "@clerk/nextjs";
import { nanoid } from "nanoid";

interface ChatHistory {
  chatId: string;
  title: string;
  messages: any[];
  createdAt: string;
  userId: string;
}

export default function ChatComponent() {
  const { user } = useUser();
  const [error, setError] = useState<Error | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('currentChatId') || nanoid();
    }
    return nanoid();
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      chatId: currentChatId,
    },
    id: currentChatId,
    initialMessages: [],
    onError: (error) => {
      setError(error);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    sessionStorage.setItem('currentChatId', currentChatId);
  }, [currentChatId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/chat/history');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [messages.length]);

  const loadChat = (chat: ChatHistory) => {
    setCurrentChatId(chat.chatId);
    sessionStorage.setItem('currentChatId', chat.chatId);
    setMessages(chat.messages);
    setIsHistoryOpen(false);
  };

  const startNewChat = () => {
    const newChatId = nanoid();
    setCurrentChatId(newChatId);
    sessionStorage.setItem('currentChatId', newChatId);
    setMessages([]);
  };

  const handleNewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-inherit">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-inherit">Mees AI</h1>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-3">
                <Bot className="h-12 w-12 mx-auto text-purple-600" />
                <h2 className="text-2xl font-semibold text-inherit">How can I help you today?</h2>
                <p className="text-base text-gray-500 dark:text-gray-400">I'm Mees AI, your research assistant.</p>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-8">
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <div className="flex items-start gap-4 max-w-3xl">
                    {message.role === "assistant" ? (
                      <div className="w-8 h-8 rounded-sm bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-sm bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-inherit">
                          {message.role === "assistant" ? "Mees AI" : "You"}
                        </span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="prose prose-sm max-w-none text-inherit dark:prose-invert">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-sm bg-purple-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600/50 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-purple-600/50 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-purple-600/50 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleNewSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Message Mees AI..."
              className="w-full rounded-lg pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-inherit placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-500 disabled:opacity-40 disabled:hover:text-gray-500"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}