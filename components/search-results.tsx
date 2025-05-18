'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SearchResultItem } from '@/lib/types'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { sanitizeUrl } from '@/lib/utils/index'
import { memo } from 'react'

export interface SearchResultsProps {
  results: SearchResultItem[]
}

export const SearchResults = memo(function SearchResults({ results }: SearchResultsProps) {
  // State to manage whether to display the results
  const [showAllResults, setShowAllResults] = useState(false)

  // Number of results to show initially (optimized for viewport size)
  const initialResultsToShow = useMemo(() => {
    if (typeof window !== 'undefined') {
      // Determine based on screen size
      return window.innerWidth < 768 ? 4 : 8
    }
    return 6 // Default value for SSR
  }, [])

  // Results to display based on state
  const displayedResults = useMemo(() => {
    return showAllResults 
      ? results 
      : results.slice(0, initialResultsToShow)
  }, [results, showAllResults, initialResultsToShow])

  // Calculate how many additional results are available
  const additionalResultsCount = useMemo(() => {
    return Math.max(0, results.length - initialResultsToShow)
  }, [results.length, initialResultsToShow])

  // Handle the "View more" button click
  const handleViewMore = () => {
    setShowAllResults(true)
  }

  const displayUrlName = (url: string) => {
    const hostname = new URL(url).hostname
    const parts = hostname.split('.')
    return parts.length > 2 ? parts.slice(1, -1).join('.') : parts[0]
  }

  return (
    <div className="flex flex-wrap -m-1">
      {displayedResults.map((result, index) => (
        <div key={index} className="w-full md:w-1/2 p-1">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold leading-tight">
                  <a
                    href={sanitizeUrl(result.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {result.title}
                  </a>
                </h3>
                <div className="text-xs text-muted-foreground line-clamp-1 opacity-70">
                  {result.url}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {result.content}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      
      {!showAllResults && additionalResultsCount > 0 && (
        <div className="w-1/2 md:w-1/4 p-1">
          <Card className="flex-1 flex h-full items-center justify-center">
            <CardContent className="p-2">
              <Button
                variant={'link'}
                className="text-muted-foreground"
                onClick={handleViewMore}
              >
                View {additionalResultsCount} more
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
})
