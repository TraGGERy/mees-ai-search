'use client'

import React from 'react'
import { Skeleton } from './ui/skeleton'

export const DefaultSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 p-4 animate-pulse">
      <div className="space-y-3">
        {/* Title skeleton with gradient shimmer */}
        <Skeleton className="h-7 w-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg" />
        
        {/* Content skeletons with varying widths */}
        <Skeleton className="w-full h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg" />
        <Skeleton className="w-[85%] h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg" />
        <Skeleton className="w-[70%] h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg" />
      </div>
    </div>
  )
}
