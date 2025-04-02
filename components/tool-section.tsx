'use client'

import { ToolInvocation } from 'ai'
import { SearchSection } from './search-section'
import { VideoSearchSection } from './video-search-section'
import RetrieveSection from './retrieve-section'
import type { SearchResults } from '@/lib/types'

interface ToolSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ToolSection({ tool, isOpen, onOpenChange }: ToolSectionProps) {
  switch (tool.toolName) {
    case 'search':
      const searchState = (() => {
        switch (tool.state) {
          case 'partial-call':
            return 'partial' as const
          case 'call':
            return 'call' as const
          case 'error':
            return 'error' as const
          default:
            return 'result' as const
        }
      })()

      return (
        <SearchSection
          tool={{
            state: searchState,
            args: tool.args as { query?: string; includeDomains?: string[] },
            result: tool.output as SearchResults | undefined,
            error: tool.error as string | undefined
          }}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )
    case 'video_search':
      return (
        <VideoSearchSection
          tool={tool}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )
    case 'retrieve':
      return (
        <RetrieveSection
          tool={tool}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )
    default:
      return null
  }
}
