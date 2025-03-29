import { Message } from 'ai'
import { PromptType } from '../utils/prompts'

export interface BaseStreamConfig {
  messages: Message[]
  model: string
  chatId: string
  searchMode: boolean
  promptType?: PromptType
} 