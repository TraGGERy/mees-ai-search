"use client";

import { useEffect, useRef } from "react";
import { Message } from "ai";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/lib/chatlib/chat";
import { BotMessage } from "./bot-message";


interface ChatListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatList({ messages, isLoading }: ChatListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 animate-in fade-in slide-in-from-bottom duration-300",
            message.role === "user" ? "flex-row-reverse" : ""
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
              message.role === "user"
                ? "bg-purple-500 text-white"
                : "bg-background"
            )}
          >
            {message.role === "user" ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>
          <div
            className={cn(
              "rounded-lg px-4 py-2 max-w-[85%] shadow-md",
              message.role === "user"
                ? "bg-purple-500 text-white"
                : "bg-muted"
            )}
          >
            {message.role === "assistant" ? (
              <BotMessage content={message.content} />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-background">
            <Bot className="h-4 w-4" />
          </div>
          <div className="space-y-2 rounded-lg bg-muted p-4 shadow-md max-w-[85%]">
            <div className="flex space-x-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}