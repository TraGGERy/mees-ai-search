import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Model } from "./types/models"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createModelId(model: Model): string {
  return `${model.providerId}-${model.id}`
} 