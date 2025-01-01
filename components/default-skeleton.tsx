'use client'

import React from 'react'
import { Skeleton } from './ui/skeleton'

export function DefaultSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-3">
        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        {/* Title */}
        <div className="h-6 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700" />
        
        {/* Paragraphs */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-11/12 rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-4/5 rounded-md bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Image Placeholder */}
        <div className="h-48 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />

        {/* More Paragraphs */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-10/12 rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-9/12 rounded-md bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* Actions Skeleton */}
      <div className="flex items-center justify-end space-x-2 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" 
          />
        ))}
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
