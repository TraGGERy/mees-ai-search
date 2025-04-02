'use client'

import { ToolInvocation } from 'ai'
import { SearchSection } from './search-section'
import { VideoSearchSection } from './video-search-section'
import RetrieveSection from './retrieve-section'
import type { SearchResults } from '@/lib/types'

type ToolState = 'call' | 'partial' | 'result' | 'error'

interface ToolSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ToolSection({ tool, isOpen, onOpenChange }: ToolSectionProps) {
  switch (tool.toolName) {
    case 'search':
      const searchState: ToolState = tool.state === 'partial-call' ? 'partial' : 
                                    tool.state === 'call' ? 'call' : 'result'

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
