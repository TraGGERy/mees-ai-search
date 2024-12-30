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
          className="w-full rounded-lg pl-6 pr-16 py-4 border-2 border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-transparent text-black placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:text-purple-600 disabled:opacity-40 disabled:hover:text-gray-400 transition-colors duration-200"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
} 