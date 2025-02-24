import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

type TrendingQuery = {
  text: string
  category: string
}

export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  const [trendingQueries, setTrendingQueries] = useState<TrendingQuery[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  // Only display the first 5 trending queries
  const displayedQueries = trendingQueries.slice(0, 5)

  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <h3 className="text-lg font-medium mb-3">Trending Topics</h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[100px]">
            <div className="relative w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Loading trending topics...</p>
          </div>
        ) : (
          <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
            {trendingQueries.length > 0 ? (
              displayedQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="link"
                  className="h-auto p-0 text-base"
                  name={query.text}
                  onClick={async () => {
                    submitMessage(query.text)
                  }}
                >
                  <ArrowRight size={16} className="mr-2 text-muted-foreground" />
                  <span className="mr-2">{getIconForCategory(query.category)}</span>
                  {query.text}
                </Button>
              ))
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
