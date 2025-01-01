'use client'

import React from 'react'

export default function ChatSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full max-w-4xl mx-auto p-4">
      <div className="w-full animate-pulse space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center space-x-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Prevent unnecessary re-renders
export const MemoizedChatSkeleton = React.memo(ChatSkeleton) 