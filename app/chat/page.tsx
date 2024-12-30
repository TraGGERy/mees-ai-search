"use client";

import { useChat } from "ai/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bot, Send, User, ChevronDown, ChevronUp } from "lucide-react";
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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

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
    onError: (error) => {
      setError(error);
      toast.error(error.message);
    },
  });

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
    setMessages(chat.messages);
    setIsHistoryOpen(false);
  };

  const handleNewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentChatId) {
      setCurrentChatId(nanoid());
    }
    await handleSubmit(e);
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col h-[100dvh] dark:bg-gray-900">
        {/* Fixed Header */}
        <div className="flex-none border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-2">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Mees AI</h1>
          </div>
        </div>

        {/* Chat History Section */}
        {chatHistory.length > 0 && (
          <div className="flex-none border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="flex items-center justify-between w-full px-4 py-2 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Previous Chats ({chatHistory.length})
              </span>
              {isHistoryOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            {isHistoryOpen && (
              <div className="max-h-36 sm:max-h-48 overflow-y-auto px-4 pb-2 sm:pb-4">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.chatId}
                    onClick={() => loadChat(chat)}
                    className="w-full text-left py-2 px-3 sm:px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors duration-200"
                  >
                    <div className="text-xs sm:text-sm font-medium truncate text-gray-900 dark:text-white">{chat.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(chat.createdAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            {messages.length === 0 && !currentChatId && (
              <div className="h-full flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                <div className="text-center space-y-2 sm:space-y-3 px-4">
                  <Bot className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-purple-600" />
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">How can I help you today?</h2>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">I&apos;m Mees AI, your research assistant.</p>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className="mb-4 sm:mb-6 last:mb-0">
                <div className="flex gap-3 sm:gap-4 max-w-3xl">
                  {message.role === "assistant" ? (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1 sm:space-y-2 overflow-hidden">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {message.role === "assistant" ? "Mees AI" : "You"}
                    </div>
                    <div className="prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mb-4 sm:mb-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Mees AI</div>
                    <div className="animate-pulse flex space-x-2 mt-2">
                      <div className="h-1.5 sm:h-2 w-1.5 sm:w-2 bg-purple-600/50 rounded-full"></div>
                      <div className="h-1.5 sm:h-2 w-1.5 sm:w-2 bg-purple-600/50 rounded-full animation-delay-200"></div>
                      <div className="h-1.5 sm:h-2 w-1.5 sm:w-2 bg-purple-600/50 rounded-full animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className="flex-none border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <form onSubmit={handleNewSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e as any)}
                placeholder="Message Mees AI..."
                className="w-full rounded-lg pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-transparent text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-500 disabled:opacity-40 disabled:hover:text-gray-400 dark:disabled:hover:text-gray-500 transition-colors duration-200 z-10"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}