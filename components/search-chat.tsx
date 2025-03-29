"use client"

import { Chat } from '@/components/chat';

export function SearchChat({ 
  id, 
  query,
  promptType 
}: { 
  id: string; 
  query: string;
  promptType: "default" | "academic" | "deepSearch";
}) {
  // Handle the event internally
  const handlePromptTypeChange = () => {
    // Implement your logic here
    console.log("Prompt type changed");
  }

  return (
    <Chat 
      id={id} 
      query={query}
      promptType={promptType} 
      onPromptTypeChange={handlePromptTypeChange}
    />
  )
} 