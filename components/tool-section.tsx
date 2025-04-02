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
      return (
        <SearchSection
          tool={{
            state: tool.state as 'call' | 'partial' | 'result' | 'error',
            args: tool.args as { query?: string; includeDomains?: string[] },
            result: tool.result as SearchResults | undefined,
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
