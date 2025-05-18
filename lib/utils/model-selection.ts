import { Model } from '../types/models'
import { PromptUsage } from '@/db/schema'

const DAILY_LIMIT = 10
const MODEL_SELECTION = {
  DEFAULT: 'openai:gpt-4.1-mini',
  FALLBACK: 'openai:gpt-4o-mini'
}

export function getModelBasedOnUsage(promptUsage: PromptUsage): string {
  const today = new Date()
  const lastReset = new Date(promptUsage.lastPromptUsageDate)
  
  // Reset count if it's a new day
  if (today.toDateString() !== lastReset.toDateString()) {
    promptUsage.dailyPromptUsage = 0
    promptUsage.lastPromptUsageDate = today
  }

  // Use default model if under daily limit
  if (promptUsage.dailyPromptUsage < DAILY_LIMIT) {
    return MODEL_SELECTION.DEFAULT
  }

  // Use fallback model if over daily limit
  return MODEL_SELECTION.FALLBACK
}

export function updatePromptUsage(promptUsage: PromptUsage): PromptUsage {
  return {
    ...promptUsage,
    dailyPromptUsage: promptUsage.dailyPromptUsage + 1,
    lastPromptUsageDate: new Date()
  }
}

export function initializePromptUsage(userId: string, email: string): PromptUsage {
  return {
    userId,
    email,
    dailyPromptUsage: 0,
    lastPromptUsageDate: new Date(),
    maxDailyPrompts: 15
  }
} 