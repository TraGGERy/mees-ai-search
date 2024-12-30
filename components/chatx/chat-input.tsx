"use client";

import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onStop: () => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e as any)}
          placeholder="Type a message..."
          className="w-full rounded-full pl-6 pr-16 py-4 border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-gray-100 text-black placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}