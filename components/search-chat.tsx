"use client"

import { Chat } from '@/components/chat';
import { Message } from 'ai';

export function SearchChat({ 
  id, 
  savedMessages, 
  promptType 
}: { 
  id: string; 
  savedMessages: Message[]; 
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
      savedMessages={savedMessages}
      promptType={promptType} 
      onPromptTypeChange={handlePromptTypeChange}
    />
  )
} 