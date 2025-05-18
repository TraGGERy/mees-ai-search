import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Model } from "./types/models"
import { type ExtendedCoreMessage } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createModelId(model: Model): string {
  return `${model.providerId}-${model.id}`
}

export function convertToUIMessages(messages: ExtendedCoreMessage[]) {
  return messages.map(message => ({
    id: message.id,
    content: message.content,
    role: message.role,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
  }))
} 