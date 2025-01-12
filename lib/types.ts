import { Chat } from "@/types/chat";

import { AIMessage } from "./types";

// Add this interface for AI search chats
export interface AISearchChat extends Chat {
  type: 'search';
  messages: AIMessage[];
} 