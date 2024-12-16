"use client";

import { useChat } from "ai/react";
import { useState } from "react";
import { toast } from "sonner";
import { Bot, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatList } from "@/components/chatx/chat-list";
import { ChatInput } from "@/components/chatx/chat-input";
import { ChatMessage, ChatError, formatError } from "@/lib/chatlib/chat";


export default function ChatPage() {
  const [error, setError] = useState<ChatError | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    stop,
  } = useChat({
    api: "/api/chat",
    onError: (error) => {
      const formattedError = formatError(error);
      setError(formattedError);
      toast.error(formattedError.message);
    },
  });

  const chatMessages: ChatMessage[] = messages.map((message) => ({
    ...message,
    timestamp: new Date(),
  }));

  const handleRetry = () => {
    setError(null);
    reload();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-3xl mx-auto">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <Bot className="h-4 w-4" />
            <h1 className="text-xl font-semibold">Chat with <b className=" text-purple-700">Mees AI</b></h1>
          </div>
          {error && error.retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0">
          Powered by Mees Ai. Ask me anything about your writing needs.
        </p>
      </div>

      <ChatList messages={chatMessages} isLoading={isLoading} />

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={stop}
      />
    </div>
  );
}