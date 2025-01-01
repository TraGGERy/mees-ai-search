import React from 'react'

export default function ChatSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="space-y-4">
        <div className="h-4 w-40 rounded bg-gray-200 animate-pulse mb-2"></div>
        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse"></div>
      </div>
    </div>
  )
} 