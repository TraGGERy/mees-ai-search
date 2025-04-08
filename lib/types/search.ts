export interface SearchResultItem {
  title: string
  url: string
  content: string
  date?: string // Optional date field for result timestamps
  // ... existing code ...
}

export interface SearchResults {
  results: SearchResultItem[]
  number_of_results: number
  metadata?: {
    enhancement?: {
      original_count: number
      filtered_count: number
      average_relevance_score: number
      threshold_used: number
    }
  }
  // ... existing code ...
} 