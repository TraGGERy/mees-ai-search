'use client'

import React from 'react'
import { Skeleton } from './ui/skeleton'

export const DefaultSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      {/* Header section */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
        <Skeleton className="h-4 w-[400px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
      </div>

      {/* Main content sections */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
            <Skeleton className="h-4 w-[90%] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
            <Skeleton className="h-4 w-[80%] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
          </div>
        ))}
      </div>

      {/* Footer section */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-[70%] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
        <Skeleton className="h-4 w-[40%] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
      </div>
    </div>
  )
}
