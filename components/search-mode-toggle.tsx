'use client'

import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import { Globe } from 'lucide-react'
import { useEffect, useState, useCallback, memo } from 'react'
import { Toggle } from './ui/toggle'

export const SearchModeToggle = memo(function SearchModeToggle() {
  const [isSearchMode, setIsSearchMode] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Load cookie only once on mount
  useEffect(() => {
    // Default to true if no cookie exists
    const savedMode = getCookie('search-mode')
    if (savedMode !== null) {
      setIsSearchMode(savedMode === 'true')
    } else {
      setCookie('search-mode', 'true')
    }
    setIsLoaded(true)
  }, [])

  // Memoize the handler to prevent unnecessary rerenders
  const handleSearchModeChange = useCallback((pressed: boolean) => {
    setIsSearchMode(pressed)
    setCookie('search-mode', pressed.toString())
  }, [])

  // Don't render anything until the cookie is loaded
  if (!isLoaded) {
    return null
  }

  return (
    <Toggle
      aria-label="Toggle search mode"
      pressed={isSearchMode}
      onPressedChange={handleSearchModeChange}
      variant="outline"
      className={cn(
        'gap-1 px-3 border border-input text-muted-foreground bg-background',
        'data-[state=on]:bg-blue-500',
        'data-[state=on]:text-white',
        'data-[state=on]:border-blue-600',
        'hover:bg-accent hover:text-accent-foreground rounded-full',
        'z-10' // Ensure it's above other elements
      )}
    >
      <Globe className="size-4" />
      <span className="text-xs font-bold">Search</span>
    </Toggle>
  )
})
