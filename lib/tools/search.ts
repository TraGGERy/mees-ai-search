import { searchSchema } from '@/lib/schema/search'
import {
  SearchResultImage,
  SearchResultItem,
  SearchResults,
  SearXNGResponse,
  SearXNGResult
} from '@/lib/types'
import { sanitizeUrl } from '@/lib/utils'
import { tool } from 'ai'
import Exa from 'exa-js'

export const searchTool = tool({
  description: 'Search the web for information',
  parameters: searchSchema,
  execute: async ({
    query,
    max_results,
    search_depth,
    include_domains,
    exclude_domains
  }) => {
    // Tavily API requires a minimum of 5 characters in the query
    const filledQuery =
      query.length < 5 ? query + ' '.repeat(5 - query.length) : query
    let searchResult: SearchResults
    const searchAPI =
      (process.env.SEARCH_API as 'tavily' | 'exa' | 'searxng') || 'tavily'

    const effectiveSearchDepth =
      searchAPI === 'searxng' &&
      process.env.SEARXNG_DEFAULT_DEPTH === 'advanced'
        ? 'advanced'
        : search_depth || 'basic'

    console.log(
      `Using search API: ${searchAPI}, Search Depth: ${effectiveSearchDepth}`
    )

    try {
      if (searchAPI === 'searxng' && effectiveSearchDepth === 'advanced') {
        // API route for advanced SearXNG search
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/advanced-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: filledQuery,
            maxResults: max_results,
            searchDepth: effectiveSearchDepth,
            includeDomains: include_domains,
            excludeDomains: exclude_domains
          })
        })
        if (!response.ok) {
          throw new Error(
            `Advanced search API error: ${response.status} ${response.statusText}`
          )
        }
        searchResult = await response.json()
      } else {
        searchResult = await (searchAPI === 'tavily'
          ? tavilySearch
          : searchAPI === 'exa'
          ? exaSearch
          : searxngSearch)(
          filledQuery,
          max_results,
          effectiveSearchDepth === 'advanced' ? 'advanced' : 'basic',
          include_domains,
          exclude_domains
        )
      }

      // Enhance search results for Pro Search
      if (effectiveSearchDepth === 'advanced') {
        searchResult = enhanceSearchResults(searchResult, filledQuery)
      }

      return searchResult
    } catch (error) {
      console.error('Search API error:', error)
      searchResult = {
        results: [],
        query: filledQuery,
        images: [],
        number_of_results: 0
      }
    }

    return searchResult
  }
})

// Enhanced relevance scoring with more sophisticated metrics
function calculateRelevanceScore(result: SearchResultItem, query: string): number {
  let score = 0
  const queryWords = query.toLowerCase().split(/\s+/)
  const content = result.content.toLowerCase()
  const title = result.title.toLowerCase()
  const url = result.url.toLowerCase()

  // Exact phrase match (highest weight)
  if (content.includes(query.toLowerCase())) {
    score += 50
  }

  // Title exact match
  if (title.includes(query.toLowerCase())) {
    score += 40
  }

  // Individual word matches in content
  queryWords.forEach(word => {
    if (content.includes(word)) {
      score += 15
    }
  })

  // Individual word matches in title
  queryWords.forEach(word => {
    if (title.includes(word)) {
      score += 10
    }
  })

  // URL relevance
  if (url.includes(query.toLowerCase())) {
    score += 20
  }

  // Content length quality (prefer longer, more detailed content)
  const wordCount = result.content.split(/\s+/).length
  if (wordCount > 500) score += 20
  else if (wordCount > 200) score += 10
  else if (wordCount < 50) score -= 10 // Penalize very short content
  // Recency boost (if date is available)
  if ('date' in result) {
    const resultDate = new Date((result as {date: string | number | Date}).date)
    const now = new Date()
    const monthsOld = (now.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsOld < 3) score += 15
    else if (monthsOld < 6) score += 10
    else if (monthsOld < 12) score += 5
  }

  // Domain authority boost
  const authorityDomains = ['edu', 'gov', 'org', 'wikipedia.org', 'github.com']
  if (authorityDomains.some(domain => url.includes(domain))) {
    score += 15
  }

  return score
}

// Enhanced content processing
function enhanceContent(content: string, query: string): string {
  // Remove excessive whitespace and normalize spacing
  content = content.replace(/\s+/g, ' ').trim()

  // Extract and highlight key sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const queryWords = query.toLowerCase().split(/\s+/)
  
  // Score sentences based on query relevance
  const scoredSentences = sentences.map(sentence => {
    let score = 0
    queryWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) {
        score += 2
      }
    })
    return { sentence, score }
  })

  // Sort sentences by relevance
  scoredSentences.sort((a, b) => b.score - a.score)

  // Take top 5 most relevant sentences if they exist
  const relevantSentences = scoredSentences
    .slice(0, 5)
    .map(s => s.sentence.trim())
    .filter(s => s.length > 0)

  // If we have relevant sentences, use them to enhance the content
  if (relevantSentences.length > 0) {
    const enhancedContent = relevantSentences.join('. ') + '.'
    return enhancedContent.length > content.length ? content : enhancedContent
  }

  return content
}

// Enhanced search results processing
function enhanceSearchResults(results: SearchResults, query: string): SearchResults {
  // Sort results by relevance
  const sortedResults = results.results.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, query)
    const scoreB = calculateRelevanceScore(b, query)
    return scoreB - scoreA
  })

  // Filter out low-quality results with dynamic threshold
  const relevanceScores = sortedResults.map(r => calculateRelevanceScore(r, query))
  const avgScore = relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length
  const threshold = Math.max(10, avgScore * 0.3) // Dynamic threshold based on average score

  const filteredResults = sortedResults.filter(result => {
    const score = calculateRelevanceScore(result, query)
    return score >= threshold
  })

  // Enhance content with additional context
  const enhancedResults = filteredResults.map(result => ({
    ...result,
    content: enhanceContent(result.content, query)
  }))

  // Add metadata about the enhancement process
  const enhancedSearchResults: SearchResults = {
    ...results,
    results: enhancedResults,
    number_of_results: enhancedResults.length,
    metadata: {
      ...results.metadata,
      enhancement: {
        original_count: results.results.length,
        filtered_count: enhancedResults.length,
        average_relevance_score: avgScore,
        threshold_used: threshold
      }
    }
  }

  return enhancedSearchResults
}

export async function search(
  query: string,
  maxResults: number = 10,
  searchDepth: 'basic' | 'advanced' = 'basic',
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  return searchTool.execute(
    {
      query,
      max_results: maxResults,
      search_depth: searchDepth,
      include_domains: includeDomains,
      exclude_domains: excludeDomains
    },
    {
      toolCallId: 'search',
      messages: []
    }
  )
}

async function tavilySearch(
  query: string,
  maxResults: number = 10,
  searchDepth: 'basic' | 'advanced' = 'basic',
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not set in the environment variables')
  }
  const includeImageDescriptions = true
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: Math.max(maxResults, 5),
      search_depth: searchDepth,
      include_images: true,
      include_image_descriptions: includeImageDescriptions,
      include_answers: true,
      include_domains: includeDomains,
      exclude_domains: excludeDomains
    })
  })

  if (!response.ok) {
    throw new Error(
      `Tavily API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  const processedImages = includeImageDescriptions
    ? data.images
        .map(({ url, description }: { url: string; description: string }) => ({
          url: sanitizeUrl(url),
          description
        }))
        .filter(
          (
            image: SearchResultImage
          ): image is { url: string; description: string } =>
            typeof image === 'object' &&
            image.description !== undefined &&
            image.description !== ''
        )
    : data.images.map((url: string) => sanitizeUrl(url))

  return {
    ...data,
    images: processedImages
  }
}

async function exaSearch(
  query: string,
  maxResults: number = 10,
  _searchDepth: string,
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) {
    throw new Error('EXA_API_KEY is not set in the environment variables')
  }

  const exa = new Exa(apiKey)
  const exaResults = await exa.searchAndContents(query, {
    highlights: true,
    numResults: maxResults,
    includeDomains,
    excludeDomains
  })

  return {
    results: exaResults.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      content: result.highlight || result.text
    })),
    query,
    images: [],
    number_of_results: exaResults.results.length
  }
}

async function searxngSearch(
  query: string,
  maxResults: number = 10,
  searchDepth: string,
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  const apiUrl = process.env.SEARXNG_API_URL
  if (!apiUrl) {
    throw new Error('SEARXNG_API_URL is not set in the environment variables')
  }

  try {
    // Construct the URL with query parameters
    const url = new URL(`${apiUrl}/search`)
    url.searchParams.append('q', query)
    url.searchParams.append('format', 'json')
    url.searchParams.append('categories', 'general,images')

    // Apply search depth settings
    if (searchDepth === 'advanced') {
      url.searchParams.append('time_range', '')
      url.searchParams.append('safesearch', '0')
      url.searchParams.append('engines', 'google,bing,duckduckgo,wikipedia')
    } else {
      url.searchParams.append('time_range', 'year')
      url.searchParams.append('safesearch', '1')
      url.searchParams.append('engines', 'google,bing')
    }

    // Fetch results from SearXNG
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`SearXNG API error (${response.status}):`, errorText)
      throw new Error(
        `SearXNG API error: ${response.status} ${response.statusText} - ${errorText}`
      )
    }

    const data: SearXNGResponse = await response.json()

    // Separate general results and image results, and limit to maxResults
    const generalResults = data.results
      .filter(result => !result.img_src)
      .slice(0, maxResults)
    const imageResults = data.results
      .filter(result => result.img_src)
      .slice(0, maxResults)

    // Format the results to match the expected SearchResults structure
    return {
      results: generalResults.map(
        (result: SearXNGResult): SearchResultItem => ({
          title: result.title,
          url: result.url,
          content: result.content
        })
      ),
      query: data.query,
      images: imageResults
        .map(result => {
          const imgSrc = result.img_src || ''
          return imgSrc.startsWith('http') ? imgSrc : `${apiUrl}${imgSrc}`
        })
        .filter(Boolean),
      number_of_results: data.number_of_results
    }
  } catch (error) {
    console.error('SearXNG API error:', error)
    throw error
  }
}
