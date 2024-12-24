'use client'

import { X } from 'lucide-react'
import { Button } from './button'
import { SignInButton } from '@clerk/nextjs'

interface ToastProps {
  message: string
  onClose: () => void
}

export function LoginToast({ message, onClose }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-purple-200 dark:border-purple-800 animate-in slide-in-from-top-2">
      <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
      <div className="flex items-center gap-2">
        <SignInButton>
          <Button
            type="button"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2"
          >
            Login
          </Button>
        </SignInButton>
        <Button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          variant="ghost"
        >
          <X size={16} className="text-gray-500" />
        </Button>
      </div>
    </div>
  )
} 