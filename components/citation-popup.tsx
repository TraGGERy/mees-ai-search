"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Button } from "./ui/button"
import { Copy, Check, Globe, BookOpen, X, Search, AlertCircle, Quote, Library } from "lucide-react"
import { Input } from "./ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useDebounce } from 'use-debounce'
import { memo } from "react"

interface CitationPopupProps {
  onClose: () => void
  content?: string
}

interface Citation {
  title: string
  authors: string
  primaryAuthor?: string
  affiliations?: string
  authorCredentials?: string
  journal?: string
  year?: string
  doi?: string
  url?: string
  abstract?: string
  type?: string
  medium?: string
  location?: string
  source?: string
  citationType?: string
  description?: string
  field?: string
  publisher?: string
  citationCount?: number
  verification?: string
  scholarlyContext?: string
  methodology?: string
  keyFindings?: string
  academicAuthority?: string
  scholarImpact?: string
  apaCitation: string
  inTextCitation: string
  topic?: string
  topicRelevance?: string
}

interface ExtractedCitation {
  text: string
  doi?: string
  isExtracted: boolean
  metadata?: CitationMetadata
}

interface CitationMetadata {
  title?: string
  authors?: string
  year?: string
  journal?: string
  source?: string
  doi?: string
  url?: string
  abstract?: string
  description?: string
  type?: string
  medium?: string
  location?: string
  citationType?: string
  field?: string
  publisher?: string
  verification?: string
  citationCount?: number
  apaCitation?: string
  inTextCitation?: string
  scholarlyContext?: string
  methodology?: string
  keyFindings?: string
  primaryAuthor?: string
  affiliations?: string
  authorCredentials?: string
  academicAuthority?: string
  scholarImpact?: string
  topic?: string
  topicRelevance?: string
}

interface RelatedWork {
  citing: string
  cited: string
  creation: string
  timespan: string
  journal_sc: string
  author_sc: string
}

// Default example citations with DOIs for common academic papers
const DEFAULT_CITATIONS: ExtractedCitation[] = [
  {
    text: "According to Smith et al. (2019), machine learning algorithms can significantly improve healthcare outcomes through early disease prediction.",
    doi: "10.1038/s41591-018-0316-z",
    isExtracted: true,
  },
  {
    text: "The BERT language model by Devlin et al. (2018) revolutionized natural language processing with its bidirectional training approach.",
    doi: "10.18653/v1/N19-1423",
    isExtracted: true,
  },
  {
    text: "In their groundbreaking study on climate change, Cook et al. (2013) found that 97% of climate scientists agree on anthropogenic global warming.",
    doi: "10.1088/1748-9326/8/2/024024",
    isExtracted: true,
  },
  {
    text: "The AlphaFold system developed by Senior et al. (2020) represents a significant breakthrough in protein structure prediction.",
    doi: "10.1038/s41586-019-1923-7",
    isExtracted: true,
  },
  {
    text: "Large language models like GPT demonstrate emergent abilities that were not explicitly trained for (Wei et al., 2022).",
    doi: "10.48550/arXiv.2206.07682",
    isExtracted: true,
  },
]

const defaultCitations = [
  {
    doi: '10.1038/s41586-019-1799-6',
    context: 'Smith et al. (2019) demonstrated the effectiveness of deep learning in natural language processing.',
    source: 'opencitations'
  },
  {
    doi: '10.18653/v1/N18-1202',
    context: 'Devlin et al. (2018) introduced the BERT model for language understanding.',
    source: 'opencitations'
  }
];

// Add error handling component
function ErrorDisplay({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// Add loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );
}

// Add loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        <div className="h-4 w-4/6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// Add no results component
function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-4xl mb-4">📚</div>
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No Citations Found</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        We couldn&apos;t find any citations in the provided content.
      </p>
    </div>
  );
}

// Add loading indicator component
function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="h-12 w-12 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 animate-pulse">
        Analyzing content for citations...
      </p>
    </div>
  );
}

export const CitationPopup: React.FC<CitationPopupProps> = ({ onClose, content }) => {
  const [doi, setDoi] = useState("")
  const [citation, setCitation] = useState<Citation | null>(null)
  const [summary, setSummary] = useState("")
  const [scholarlyInfo, setScholarlyInfo] = useState("")
  const [relatedWorks, setRelatedWorks] = useState<RelatedWork[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [tab, setTab] = useState<"citation" | "summary" | "related">("citation")
  const [extractedCitations, setExtractedCitations] = useState<ExtractedCitation[]>([])
  const [extractionLoading, setExtractionLoading] = useState(false)
  const [aiExtractionDone, setAiExtractionDone] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreRelated, setHasMoreRelated] = useState(true)
  const [selectedCitationIndex, setSelectedCitationIndex] = useState<number | null>(null)

  // Extract citations from content when component mounts
  useEffect(() => {
    if (content) {
      // First do a basic extraction
      const basicExtracted = basicExtractCitations(content)
      setExtractedCitations(basicExtracted)

      if (basicExtracted.length > 0 && basicExtracted[0].doi) {
        setDoi(basicExtracted[0].doi)
      }

      // Then use AI for deeper extraction
      aiExtractCitations(content)
    }
  }, [content])

  // Basic extraction for immediate results
  const basicExtractCitations = (text: string): ExtractedCitation[] => {
    try {
      // Pattern to match DOIs in text
      const doiPattern = /\b10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+\b/g
      const dois = text.match(doiPattern) || []

      // Extract citation contexts using patterns
      const sentences = text.split(/(?<=[.!?])\s+/)
      const citationTexts: ExtractedCitation[] = []

      sentences.forEach((sentence) => {
        // Check for DOIs in the sentence
        const match = sentence.match(doiPattern)
        if (match) {
          citationTexts.push({
            text: sentence.trim(),
            doi: match[0],
            isExtracted: true,
          })
          return
        }

        // Check for citation patterns without DOIs
        if (
          // Author patterns
          /\b(?:[A-Z][a-z]+(?:,? (?:and |& )?)?){1,3}(?: et al\.)\b/.test(sentence) ||
          // Year patterns
          /$$[12][0-9]{3}[a-z]?$$/.test(sentence) ||
          // Citation verbal cues with author mention
          /\b(?:according to|cited by|as noted by|published by|research by|study by|work by|paper by)\s+[A-Z][a-z]+\b/i.test(
            sentence,
          )
        ) {
          citationTexts.push({
            text: sentence.trim(),
            isExtracted: true,
          })
        }
      })

      return citationTexts
    } catch (err) {
      console.error("Error in basic citation extraction:", err)
      return []
    }
  }

  // AI-powered extraction for thorough analysis
  const aiExtractCitations = async (text: string) => {
    setExtractionLoading(true)

    try {
      // Call the AI endpoint to extract citations
      const response = await fetch("/api/extract-citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze citations")
      }

      const data = await response.json()

      if (data.citations && data.citations.length > 0) {
        const extractedCits = data.citations.map((cit: any) => ({
            text: cit.text,
          doi: cit.metadata?.doi || null,
            isExtracted: true,
          metadata: cit.metadata
        }))
        
        setExtractedCitations(extractedCits)

        // If we have metadata directly from the extraction, use it right away
        if (extractedCits.length > 0 && extractedCits[0].metadata) {
          // Format the metadata for display
          const metadata = extractedCits[0].metadata
          
          // Only set citation if we have title and authors
          if (metadata.title && metadata.authors) {
            const formattedCitation = {
              title: metadata.title,
              authors: metadata.authors,
              journal: metadata.journal || metadata.source || 'Unknown Journal',
              year: metadata.year || 'Unknown Year',
              doi: metadata.doi || '',
              url: metadata.url || '',
              abstract: metadata.abstract || metadata.description || '',
              type: metadata.type || 'unknown',
              medium: metadata.medium || '',
              location: metadata.location || '',
              source: metadata.source || '',
              citationType: metadata.citationType || 'academic',
              field: metadata.field || '',
              description: metadata.description || '',
              publisher: metadata.publisher || '',
              verification: metadata.verification || 'unverified',
              citationCount: metadata.citationCount || 0,
              apaCitation: metadata.apaCitation || `${metadata.authors} (${metadata.year || 'n.d.'}). ${metadata.title}. ${metadata.journal || metadata.source || 'Unknown Journal'}.`,
              inTextCitation: metadata.inTextCitation || `(${metadata.authors.split(',')[0].trim()}${metadata.authors.includes(',') ? ' et al.' : ''}, ${metadata.year || 'n.d.'})`,
              scholarlyContext: metadata.scholarlyContext || '',
              methodology: metadata.methodology || '',
              keyFindings: metadata.keyFindings || '',
              primaryAuthor: metadata.primaryAuthor || '',
              affiliations: metadata.affiliations || '',
              authorCredentials: metadata.authorCredentials || '',
              academicAuthority: metadata.academicAuthority || '',
              scholarImpact: metadata.scholarImpact || '',
              topic: metadata.topic || '',
              topicRelevance: metadata.topicRelevance || ''
            }
            
            setCitation(formattedCitation)
            setSummary(metadata.description || metadata.abstract || 'No summary available.')
          }
        }
        
        // Set the first DOI if available for fetching additional details
        if (extractedCits[0].doi) {
          setDoi(extractedCits[0].doi)
        }
      }
    } catch (err) {
      console.error("Error in AI citation extraction:", err)
      // We don't reset extractedCitations here since we already
      // have the basic extractions as a fallback
    } finally {
      setExtractionLoading(false)
      setAiExtractionDone(true)
    }
  }

  // Add error handling for fetch requests
  const safeJsonParse = async (response: Response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text}`);
    }
  };

  // Add debounced search
  const [debouncedValue] = useDebounce(doi, 300);

  // Effect to handle debounced search
  useEffect(() => {
    if (debouncedValue && debouncedValue.trim()) {
      fetchCitation(debouncedValue);
    }
  }, [debouncedValue]);

  // Add error handling for citation fetching
  const fetchCitation = async (doiToFetch: string = doi) => {
    if (!doiToFetch.trim()) {
      setError("Please enter a DOI");
      return;
    }

    setLoading(true);
    setError("");
    setCitation(null);
    setSummary("");
    setScholarlyInfo("");
    setRelatedWorks([]);
    setPage(1);
    setHasMoreRelated(true);

    try {
      const response = await fetch('/api/citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doi: doiToFetch.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await safeJsonParse(response);

      if (!data || !data.citation) {
        throw new Error('Invalid response format');
      }

      setCitation(data.citation);
      setSummary(data.summary || '');
      if (data.scholarlyInfo) {
        setScholarlyInfo(data.scholarlyInfo);
      }
      if (data.relatedWorks) {
        setRelatedWorks(data.relatedWorks);
        setHasMoreRelated(data.relatedWorks.length >= 5);
      }
    } catch (err: any) {
      console.error('Error fetching citation:', err);
      setError(err.message || "Failed to fetch citation data");
    } finally {
      setLoading(false);
    }
  };

  // Add retry mechanism for failed requests
  const retryFetch = useCallback(async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await fetchCitation();
        return;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }, [doi]);

  const loadMoreRelatedWorks = async () => {
    if (loadingMore || !doi.trim()) return

    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const response = await fetch("/api/related-citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doi: doi.trim(), page: nextPage }),
      })

      if (!response.ok) {
        throw new Error("Failed to load more related works")
      }

      const data = await response.json()
      if (data.relatedWorks && data.relatedWorks.length > 0) {
        setRelatedWorks(prev => [...prev, ...data.relatedWorks])
        setPage(nextPage)
        setHasMoreRelated(data.relatedWorks.length >= 5)
      } else {
        setHasMoreRelated(false)
      }
    } catch (err: any) {
      console.error("Error loading more related works:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleCopyCitation = () => {
    if (!citation) return

    navigator.clipboard.writeText(citation.apaCitation)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleCopyInTextCitation = () => {
    if (!citation) return

    navigator.clipboard.writeText(citation.inTextCitation)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleCopySummary = () => {
    if (!summary) return

    navigator.clipboard.writeText(summary)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 1500)
  }

  const openURL = () => {
    if (citation?.url) {
      window.open(citation.url, "_blank")
    }
  }

  // Add citation type badge renderer
  const getCitationTypeBadge = (type?: string) => {
    if (!type) return null;
    
    let color = "";
    let icon = null;
    
    switch(type.toLowerCase()) {
      case 'artwork':
        color = "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800";
        icon = <BookOpen className="h-3 w-3 mr-1"/>;
        break;
      case 'book':
        color = "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800";
        icon = <BookOpen className="h-3 w-3 mr-1"/>;
        break;
      case 'website':
      case 'web':
        color = "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800";
        icon = <Globe className="h-3 w-3 mr-1"/>;
        break;
      case 'academic':
      case 'article':
      default:
        color = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
        icon = <BookOpen className="h-3 w-3 mr-1"/>;
  }

  return (
      <span className={`px-2 py-0.5 text-xs inline-flex items-center rounded-full border ${color}`}>
        {icon}
        {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
      </span>
    );
  };

  // Add verification status badge
  const getVerificationBadge = (verification?: string) => {
    if (!verification) return null;
    
    let color = "";
    let icon = null;
    
    switch(verification.toLowerCase()) {
      case 'verified':
        color = "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800";
        icon = <Check className="h-3 w-3 mr-1"/>;
        break;
      case 'partial':
        color = "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800";
        icon = <AlertCircle className="h-3 w-3 mr-1"/>;
        break;
      case 'unverified':
      default:
        color = "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800";
        icon = <AlertCircle className="h-3 w-3 mr-1"/>;
    }
    
    return (
      <span className={`px-2 py-0.5 text-xs inline-flex items-center rounded-full border ${color}`}>
        {icon}
        {verification.charAt(0).toUpperCase() + verification.slice(1).toLowerCase()}
      </span>
    );
  };

  // Add this function to handle clicking on a citation
  const handleCitationClick = (citation: ExtractedCitation) => {
    try {
      console.log("Citation clicked:", citation);
      
      // If this citation has embedded metadata, use it directly
      if (citation.metadata) {
        const metadata = citation.metadata;
        
        // Format the citation data
        const formattedCitation: Citation = {
          title: metadata.title || citation.text || '',
          authors: metadata.authors || '',
          journal: metadata.journal || metadata.source || '',
          year: metadata.year || '',
          doi: metadata.doi || '',
          url: metadata.url || '',
          abstract: metadata.abstract || metadata.description || '',
          type: metadata.type || 'unknown',
          medium: metadata.medium || '',
          location: metadata.location || '',
          source: metadata.source || '',
          citationType: metadata.citationType || 'academic',
          field: metadata.field || '',
          description: metadata.description || '',
          publisher: metadata.publisher || '',
          verification: metadata.verification || 'unverified',
          citationCount: metadata.citationCount || 0,
          // Generate APA citation if not provided
          apaCitation: metadata.apaCitation || 
            `${metadata.authors ? metadata.authors + ' ' : ''}(${metadata.year || 'n.d.'}). ${metadata.title || citation.text || ''}. ${metadata.journal || metadata.source || ''}.`,
          // Generate in-text citation if not provided
          inTextCitation: metadata.inTextCitation || 
            `(${metadata.authors ? metadata.authors.split(',')[0].trim() + (metadata.authors.includes(',') ? ' et al.' : '') + ', ' : ''}${metadata.year || 'n.d.'})`,
          scholarlyContext: metadata.scholarlyContext || '',
          methodology: metadata.methodology || '',
          keyFindings: metadata.keyFindings || '',
          primaryAuthor: metadata.primaryAuthor || '',
          affiliations: metadata.affiliations || '',
          authorCredentials: metadata.authorCredentials || '',
          academicAuthority: metadata.academicAuthority || '',
          scholarImpact: metadata.scholarImpact || '',
          topic: metadata.topic || '',
          topicRelevance: metadata.topicRelevance || ''
        };
        
        setCitation(formattedCitation);
        setError("");
        setSummary(metadata.description || metadata.abstract || 'No summary available.');
        
        // If DOI is available, set it but don't refetch
        if (metadata.doi) {
          setDoi(metadata.doi);
        }
        
        // Switch to citation tab
        setTab("citation");
      } 
      // If no metadata but has DOI, fetch it
      else if (citation.doi) {
        setDoi(citation.doi);
        fetchCitation(citation.doi);
      }
      // Otherwise just display the citation text in a basic format
      else {
        console.log("Creating simple citation from text:", citation.text);
        const simpleCitation: Citation = {
          title: citation.text || '',
          authors: '',
          journal: '',
          year: '',
          doi: '',
          url: '',
          abstract: citation.text,
          type: 'unknown',
          verification: 'unverified',
          apaCitation: citation.text,
          inTextCitation: citation.text,
          scholarlyContext: '',
          methodology: '',
          keyFindings: '',
          primaryAuthor: '',
          affiliations: '',
          authorCredentials: '',
          academicAuthority: '',
          scholarImpact: '',
          topic: '',
          topicRelevance: ''
        };
        
        setCitation(simpleCitation);
        setError("");
        setSummary(citation.text);
        
        // Switch to citation tab
        setTab("citation");
      }
    } catch (err) {
      console.error("Error handling citation click:", err);
      setError("Failed to display citation details. Please try another citation.");
    }
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Add focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, []);

  // Add performance optimization for citation list
  const MemoizedCitationList = useMemo(() => {
    return extractedCitations.map((cit, index) => (
      <div
        key={`${cit.doi || cit.text}-${index}`}
        className={`p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-colors cursor-pointer ${
          selectedCitationIndex === index ? 'bg-blue-50 border border-blue-200' : ''
        }`}
        onClick={() => {
          setSelectedCitationIndex(index);
          handleCitationClick(cit);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setSelectedCitationIndex(index);
            handleCitationClick(cit);
          }
        }}
        role="button"
        tabIndex={0}
        aria-selected={selectedCitationIndex === index}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2 line-clamp-2">
              {cit.metadata?.title || 'Untitled Citation'}
            </p>
            {cit.metadata?.authors && (
              <p className="text-xs text-zinc-500 mt-1">
                {cit.metadata.authors}
              </p>
            )}
            {cit.metadata?.year && (
              <p className="text-xs text-zinc-500">
                {cit.metadata.year}
              </p>
            )}
          </div>
        </div>
      </div>
    ));
  }, [extractedCitations, selectedCitationIndex]);

  // Add this function after the other handler functions
  const handleCopyAllCitations = () => {
    if (!extractedCitations.length) return;

    const formattedCitations = extractedCitations.map((citation, index) => {
      const metadata = citation.metadata;
      if (!metadata) return `${index + 1}. ${citation.text}`;

      return `${index + 1}. ${metadata.apaCitation || citation.text}
      ${metadata.description ? `Summary: ${metadata.description}` : ''}
      ${metadata.topic ? `Topic: ${metadata.topic}` : ''}
      ${metadata.topicRelevance ? `Relevance: ${metadata.topicRelevance}` : ''}
      ${metadata.primaryAuthor ? `Primary Author: ${metadata.primaryAuthor}` : ''}
      ${metadata.authorCredentials ? `Credentials: ${metadata.authorCredentials}` : ''}
      ${metadata.affiliations ? `Affiliations: ${metadata.affiliations}` : ''}
      ${metadata.academicAuthority ? `Academic Authority: ${metadata.academicAuthority}` : ''}
      ${metadata.scholarImpact ? `Scholarly Impact: ${metadata.scholarImpact}` : ''}
      ${metadata.scholarlyContext ? `Context: ${metadata.scholarlyContext}` : ''}
      ${metadata.methodology ? `Methodology: ${metadata.methodology}` : ''}
      ${metadata.keyFindings ? `Key Findings: ${metadata.keyFindings}` : ''}
      `;
    }).join('\n\n');

    navigator.clipboard.writeText(formattedCitations);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="citation-popup-title"
      ref={modalRef}
    >
      <div className="bg-white dark:bg-zinc-900 w-full h-full md:h-auto md:max-h-[90vh] md:w-[95vw] md:max-w-4xl lg:max-w-5xl md:rounded-2xl md:shadow-xl relative flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <h2 id="citation-popup-title" className="text-lg sm:text-xl font-medium text-zinc-900 dark:text-zinc-100">
            Academic Citations
          </h2>
          <div className="flex items-center gap-2">
            {extractedCitations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 text-xs transition-colors"
                onClick={handleCopyAllCitations}
              >
                {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                {copied ? "Copied!" : "Copy All Citations"}
              </Button>
            )}
            <button
              className="flex-shrink-0 p-1.5 rounded-full text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={onClose}
              aria-label="Close citation popup"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 w-full p-4">
            <div className="flex-grow w-full">
              <Input
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="Enter DOI (e.g., 10.1038/nature12373)"
                className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
              aria-label="DOI search input"
              ref={initialFocusRef}
              />
            </div>
            <Button
              onClick={() => fetchCitation()}
              disabled={loading || !doi.trim()}
              className="sm:flex-shrink-0 w-full sm:w-auto h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
            aria-label="Search for citation"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Searching...
              </div>
            ) : (
              <>
              <Search size={16} className="mr-2" />
              Search
              </>
            )}
            </Button>
          </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {error && <ErrorDisplay error={error} onRetry={() => retryFetch()} />}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
            {/* Left column - Citations list */}
            <div className="lg:col-span-5">
              {extractionLoading ? (
                <LoadingIndicator />
              ) : loading ? (
                <div className="space-y-4">
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                          </div>
              ) : extractedCitations.length === 0 && aiExtractionDone ? (
                <NoResults />
              ) : (
                <div role="region" aria-label="Found citations">
                  {MemoizedCitationList}
                              </div>
                            )}
            </div>

            {/* Right column - Citation details */}
            <div className="lg:col-span-7">
              {extractionLoading ? (
                <Card className="mb-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <CardHeader className="p-0">
                    <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
                      <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                    </div>
                    <LoadingIndicator />
                  </CardHeader>
                </Card>
              ) : loading ? (
                <Card className="mb-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <CardHeader className="p-0">
                    <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
                      <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                    </div>
                    <LoadingSkeleton />
                  </CardHeader>
                </Card>
              ) : citation && (
                <Card className="mb-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <CardHeader className="p-0">
                    <Tabs
                      defaultValue="citation"
                      value={tab}
                      onValueChange={(value) => setTab(value as any)}
                      className="w-full"
                    >
                      <TabsList className="w-full justify-start rounded-none border-b border-zinc-200 dark:border-zinc-800 bg-transparent p-0">
                        <TabsTrigger
                          value="citation"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 px-4 py-2"
                        >
                          <div className="flex items-center">
                            <BookOpen size={16} className="mr-1.5" />
                            Citation
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="summary"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 px-4 py-2"
                        >
                          <div className="flex items-center">
                            <Quote size={16} className="mr-1.5" />
                            Summary
                          </div>
                        </TabsTrigger>
                        {relatedWorks.length > 0 && (
                          <TabsTrigger
                            value="related"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 px-4 py-2"
                          >
                            <div className="flex items-center">
                              <Library size={16} className="mr-1.5" />
                              Related
                            </div>
                          </TabsTrigger>
                        )}
                      </TabsList>

                      <TabsContent value="citation" className="p-4 mt-0">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                            <div className="flex gap-2 items-center">
                              {citation?.citationType && getCitationTypeBadge(citation.citationType)}
                              {citation?.verification && getVerificationBadge(citation.verification)}
                            </div>
                            {citation?.field && (
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Field: {citation.field}
                              </span>
                            )}
                          </div>
                          
                          {/* Add topic information for suggested citations */}
                          {citation?.topic && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Related Topic</h4>
                              <p className="text-sm text-blue-700 dark:text-blue-400">{citation.topic}</p>
                              {citation.topicRelevance && (
                                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">{citation.topicRelevance}</p>
                              )}
                            </div>
                          )}
                          
                          <div className="mb-4">
                            {citation.title && (
                              <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-1">{citation.title}</h3>
                            )}
                            {(citation.authors || citation.year) && (
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                {citation.authors && <><span className="font-medium">By:</span> {citation.authors}</>}
                                {citation.year && <>{citation.authors ? ' ' : ''}({citation.year})</>}
                              </p>
                            )}
                            
                            {citation.primaryAuthor && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                <span className="font-medium">Primary Author:</span> {citation.primaryAuthor}
                              </p>
                            )}
                            
                            {citation.affiliations && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                <span className="font-medium">Affiliations:</span> {citation.affiliations}
                              </p>
                            )}
                            
                            {citation.authorCredentials && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                <span className="font-medium">Author Credentials:</span> {citation.authorCredentials}
                              </p>
                            )}
                            
                            {(citation.medium || citation.location) && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                {citation.medium && <span><span className="font-medium">Medium: </span>{citation.medium}</span>}
                                {citation.medium && citation.location && <span> • </span>}
                                {citation.location && <span><span className="font-medium">Location: </span>{citation.location}</span>}
                              </p>
                            )}
                            {(citation.journal || citation.source) && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                <span className="font-medium">Source: </span>
                                {citation.journal || citation.source}
                              </p>
                            )}
                            
                            {citation.academicAuthority && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md border border-blue-100 dark:border-blue-800">
                                <span className="font-medium">Academic Authority: </span>
                                {citation.academicAuthority}
                              </p>
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">APA Citation</h4>
                            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">{citation.apaCitation}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">In-Text Citation</h4>
                            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">{citation.inTextCitation}</p>
                              {citation.topic && (
                                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                    <span className="font-medium">Context:</span> This citation discusses {citation.topic.toLowerCase()}. 
                                    {citation.topicRelevance && ` ${citation.topicRelevance}`}
                                  </p>
                          </div>
                        )}
                              {citation.primaryAuthor && (
                                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                    <span className="font-medium">Key Scholar:</span> {citation.primaryAuthor}
                                    {citation.authorCredentials && ` (${citation.authorCredentials})`}
                                  </p>
                                </div>
                              )}
                              {citation.scholarlyContext && (
                                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                    <span className="font-medium">Scholarly Context:</span> {citation.scholarlyContext}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 text-xs transition-colors"
                              onClick={handleCopyCitation}
                          >
                              {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                              {copied ? "Copied!" : "Copy APA Citation"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 text-xs transition-colors"
                              onClick={handleCopyInTextCitation}
                          >
                            {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                              {copied ? "Copied!" : "Copy In-Text Citation"}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 text-xs transition-colors"
                              onClick={openURL}
                            >
                              <Globe size={14} className="mr-1.5" />
                              Visit Source
                          </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="summary" className="p-4 mt-0">
                        <h4 className="text-xs text-zinc-700 dark:text-zinc-300 uppercase font-medium mb-3">
                          AI-Generated Summary
                        </h4>
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl mb-4 border border-zinc-200 dark:border-zinc-700">
                          <ScrollArea className="h-[30vh]">
                            <div className="space-y-4">
                              {/* Scholar Information */}
                              {citation?.primaryAuthor && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Scholar</h5>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {citation.primaryAuthor}
                                    {citation.authorCredentials && ` (${citation.authorCredentials})`}
                                    {citation.affiliations && `, affiliated with ${citation.affiliations}`}
                                  </p>
                                </div>
                              )}
                              
                              {/* Concept Information */}
                              {citation?.topic && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Key Concept</h5>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {citation.topic}
                                    {citation.topicRelevance && `: ${citation.topicRelevance}`}
                                  </p>
                                </div>
                              )}
                              
                              {/* Main Summary */}
                              <div className="mb-3">
                                <h5 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Summary</h5>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{summary}</p>
                              </div>
                              
                              {/* Scholarly Context */}
                              {citation?.scholarlyContext && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Scholarly Context</h5>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {citation.scholarlyContext}
                                  </p>
                                </div>
                              )}
                              
                              {/* Methodology */}
                              {citation?.methodology && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Methodology</h5>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {citation.methodology}
                                  </p>
                                </div>
                              )}
                              
                              {/* Key Findings */}
                              {citation?.keyFindings && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Key Findings</h5>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {citation.keyFindings}
                                  </p>
                                </div>
                              )}
                              
                              {/* Scholarly Impact */}
                              {citation?.scholarImpact && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1 flex items-center">
                                    <span className="mr-1.5">🔍</span> Scholarly Impact
                                  </h5>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {citation.scholarImpact}
                                  </p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full px-3 py-1 text-xs transition-colors"
                            onClick={handleCopySummary}
                          >
                            {copiedSummary ? (
                              <Check size={14} className="mr-1.5" />
                            ) : (
                              <Copy size={14} className="mr-1.5" />
                            )}
                            {copiedSummary ? "Copied!" : "Copy Summary"}
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="related" className="p-4 mt-0">
                        <h4 className="text-xs text-zinc-700 dark:text-zinc-300 uppercase font-medium mb-3">
                          Related Works
                        </h4>
                        <ScrollArea className="h-[35vh]">
                          <div className="space-y-3 pr-1">
                            {relatedWorks.map((work, index) => (
                              <div
                                key={index}
                                className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700 hover:shadow-sm transition-shadow"
                              >
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2 break-all">
                                  <span className="text-blue-600 dark:text-blue-400 font-medium mr-1 whitespace-nowrap text-xs">
                                    Citing DOI:
                                  </span>
                                  {work.citing}
                                </p>
                                {work.journal_sc && (
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                                    <span className="font-medium">Journal:</span> {work.journal_sc}
                                  </p>
                                )}
                                {work.author_sc && (
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                                    <span className="font-medium">Author:</span> {work.author_sc}
                                  </p>
                                )}
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full px-3 transition-colors"
                                    onClick={() => {
                                      setDoi(work.citing)
                                      fetchCitation(work.citing)
                                    }}
                                  >
                                    <Search className="h-3 w-3 mr-1" />
                                    View Citation
                                  </Button>
                                </div>
                              </div>
                            ))}
                            
                            {hasMoreRelated && (
                              <div className="flex justify-center pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full px-4 py-1 text-xs transition-colors"
                                  onClick={loadMoreRelatedWorks}
                                  disabled={loadingMore}
                                >
                                  {loadingMore ? (
                                    <>
                                      <div className="animate-spin mr-2 h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
                                      Loading...
                                    </>
                                  ) : (
                                    "Load More"
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </CardHeader>
                </Card>
              )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 z-10 flex justify-end p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
          <Button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-1 text-sm transition-colors"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default memo(CitationPopup);
