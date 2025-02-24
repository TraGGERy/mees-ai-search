import { TrendingQuery } from '@/app/api/trending/route'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  const [trendingQueries, setTrendingQueries] = useState<TrendingQuery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/trending')
        if (!response.ok) throw new Error('Failed to fetch trending topics')
        const data = await response.json()
        setTrendingQueries(data)
      } catch (error) {
        console.error('Error fetching trending topics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrending()
  }, [])

  const displayedQueries = showAll 
    ? trendingQueries 
    : trendingQueries.slice(0, 4)

  const hasMoreQueries = trendingQueries.length > 4

  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <h3 className="text-lg font-medium mb-3">Trending Topics</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="relative w-8 h-8">
              <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-2 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
            {trendingQueries.length > 0 ? (
              <>
                {displayedQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="link"
                    className="h-auto p-0 text-base"
                    onClick={() => submitMessage(query.text)}
                  >
                    <ArrowRight size={16} className="mr-2 text-muted-foreground" />
                    <span className="mr-2">{getIconForCategory(query.category)}</span>
                    {query.text}
                  </Button>
                ))}
                
                {hasMoreQueries && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-muted-foreground"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="mr-1 h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-4 w-4" />
                        Show More
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No trending topics available</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getIconForCategory(category: string): string {
  const categoryIcons: Record<string, string> = {
    trending: '🔥',
    community: '👥',
    science: '🔬',
    tech: '💻',
    travel: '✈️',
    politics: '🏛️',
    health: '🏥',
    sports: '🏆',
    finance: '💰',
    football: '⚽',
    question: '❓'
  }

  return categoryIcons[category] || '📌'
}
