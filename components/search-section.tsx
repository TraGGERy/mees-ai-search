'use client'

import { CHAT_ID } from '@/lib/constants'
import type { SearchResults as TypeSearchResults } from '@/lib/types'
import { useChat } from 'ai/react'
import { memo, useMemo } from 'react'
import { CollapsibleMessage } from './collapsible-message'
import { SearchSkeleton } from './default-skeleton'
import { SearchResults } from './search-results'
import { SearchResultsImageSection } from './search-results-image'
import { Section, ToolArgsSection } from './section'
import { Badge } from './ui/badge'

interface SearchSectionProps {
  tool: {
    state: 'call' | 'partial' | 'result' | 'error'
    args: {
      query?: string
      includeDomains?: string[]
    }
    result?: TypeSearchResults
    error?: string
  }
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export const SearchSection = memo(function SearchSection({
  tool,
  isOpen,
  onOpenChange
}: SearchSectionProps) {
  const { isLoading } = useChat({
    id: CHAT_ID
  })
  
  const isToolLoading = tool.state === 'call'
  const isPartial = tool.state === 'partial'
  const hasError = tool.state === 'error'
  const searchResults: TypeSearchResults | undefined =
    tool.state === 'result' || tool.state === 'partial' ? tool.result : undefined
  const query = tool.args.query as string | undefined
  
  // Memoize the domains string to avoid recalculating on every render
  const includeDomainsString = useMemo(() => {
    const includeDomains = tool.args.includeDomains as string[] | undefined
    return includeDomains ? ` [${includeDomains.join(', ')}]` : ''
  }, [tool.args.includeDomains])

  // Memoize the header component to avoid recreating on every render
  const header = useMemo(() => (
    <div className="flex items-center gap-2">
      <ToolArgsSection
        tool="search"
        number={searchResults?.results?.length}
      >{`${query}${includeDomainsString}`}</ToolArgsSection>
      {isToolLoading && (
        <Badge variant="secondary" className="animate-pulse">
          Searching...
        </Badge>
      )}
      {isPartial && (
        <Badge variant="secondary" className="animate-pulse">
          Loading more results...
        </Badge>
      )}
      {hasError && (
        <Badge variant="destructive">
          Search failed
        </Badge>
      )}
    </div>
  ), [query, includeDomainsString, searchResults?.results?.length, isToolLoading, isPartial, hasError])

  // Show loading state immediately when tool is called
  if (isToolLoading) {
    return (
      <CollapsibleMessage
        role="assistant"
        isCollapsible={true}
        header={header}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Searching the web for relevant information...
          </div>
          <SearchSkeleton />
        </div>
      </CollapsibleMessage>
    )
  }

  // Show error state if search failed
  if (hasError) {
    return (
      <CollapsibleMessage
        role="assistant"
        isCollapsible={true}
        header={header}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <div className="text-sm text-destructive">
          {tool.error || 'Failed to execute search. Please try again.'}
        </div>
      </CollapsibleMessage>
    )
  }

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="space-y-4">
        {searchResults?.images && searchResults.images.length > 0 && (
          <Section>
            <SearchResultsImageSection
              images={searchResults.images}
              query={query}
            />
          </Section>
        )}
        {searchResults?.results ? (
          <Section title="Sources">
            <SearchResults results={searchResults.results} />
            {isPartial && (
              <div className="mt-4 text-sm text-muted-foreground">
                Loading more results...
              </div>
            )}
          </Section>
        ) : null}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="animate-pulse">
              Generating response...
            </Badge>
          </div>
        )}
      </div>
    </CollapsibleMessage>
  )
})
