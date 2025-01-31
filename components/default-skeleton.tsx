'use client'

import React from 'react'
import { Skeleton } from './ui/skeleton'

const GradientSkeleton = React.memo(({ className }: { className: string }) => (
  <Skeleton 
    className={`${className} animate-[pulse_0.7s_ease-in-out_infinite] bg-gradient-to-r from-gray-800 to-gray-700`} 
  />
))

GradientSkeleton.displayName = 'GradientSkeleton'

export const DefaultSkeleton = () => {
  return (
    <div className="w-full space-y-6 p-4">
      {/* Search title section */}
      <div className="flex items-center space-x-3 pb-2">
        <GradientSkeleton className="h-5 w-5 rounded-md" /> {/* Search icon placeholder */}
        <GradientSkeleton className="h-5 w-48" /> {/* Search text placeholder */}
      </div>

      {/* Images section */}
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => (
          <GradientSkeleton key={i} className="h-24 w-32 flex-shrink-0 rounded-lg" />
        ))}
      </div>

      {/* Sources section */}
      <div className="space-y-2">
        <GradientSkeleton className="h-5 w-24" />
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {[...Array(3)].map((_, i) => (
            <GradientSkeleton key={i} className="h-16 w-48 flex-shrink-0 rounded-md" />
          ))}
        </div>
      </div>

      {/* Answer section with mixed content */}
      <div className="space-y-4">
        <GradientSkeleton className="h-6 w-32" />
        <div className="space-y-4">
          {/* Text blocks */}
          <div className="space-y-2">
            <GradientSkeleton className="h-4 w-full" />
            <GradientSkeleton className="h-4 w-[90%]" />
            <GradientSkeleton className="h-4 w-[95%]" />
          </div>
          
          {/* Inline image with text */}
          <div className="flex space-x-4">
            <GradientSkeleton className="h-32 w-48 flex-shrink-0 rounded-lg" />
            <div className="space-y-2 flex-1">
              <GradientSkeleton className="h-4 w-full" />
              <GradientSkeleton className="h-4 w-[85%]" />
              <GradientSkeleton className="h-4 w-[90%]" />
            </div>
          </div>

          {/* More text */}
          <div className="space-y-2">
            <GradientSkeleton className="h-4 w-[92%]" />
            <GradientSkeleton className="h-4 w-full" />
            <GradientSkeleton className="h-4 w-[88%]" />
          </div>
        </div>
      </div>

      {/* Related sources */}
      <div className="space-y-2">
        <GradientSkeleton className="h-5 w-36" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <GradientSkeleton className="h-24 w-full rounded-md" />
              <GradientSkeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Input section */}
      <div className="mt-auto pt-4">
        <GradientSkeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}
