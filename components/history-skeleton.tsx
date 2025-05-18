import React from 'react'
import { Skeleton } from './ui/skeleton'

export function HistorySkeleton() {
  return (
    <div className="flex flex-col flex-1 space-y-2 overflow-auto">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-1 p-2 rounded">
          <Skeleton className="w-3/4 h-4 rounded-sm animate-pulse" />
          <Skeleton className="w-1/2 h-3 rounded-sm animate-pulse opacity-70" />
        </div>
      ))}
    </div>
  )
}
