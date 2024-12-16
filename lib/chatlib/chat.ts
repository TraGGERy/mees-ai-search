import { type Message } from 'ai';

export interface ChatMessage extends Message {
  timestamp: Date;
}

export type ChatStatus = 'idle' | 'loading' | 'error';

export interface ChatError {
  message: string;
  code?: string;
  retry?: boolean;
}

export const MAX_MESSAGES = 100;
export const RATE_LIMIT_MESSAGES = 50;
export const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds

export function formatError(error: any): ChatError {
  if (error.code === 'rate_limit_exceeded') {
    return {
      message: 'You have reached the maximum number of messages per hour. Please try again later.',
      code: 'rate_limit',
      retry: true,
    };
  }

  if (error.code === 'context_length_exceeded') {
    return {
      message: 'The conversation is too long. Please start a new chat.',
      code: 'context_length',
      retry: false,
    };
  }

  return {
    message: 'An error occurred. Please try again.',
    code: 'unknown',
    retry: true,
  };
}