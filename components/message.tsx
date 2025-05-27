'use client'

import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Citing } from './custom-link'
import { CodeBlock } from './ui/codeblock'
import { MemoizedReactMarkdown } from './ui/markdown'
import { useState, useEffect, useRef } from 'react'
import { Skeleton } from './ui/skeleton'

export function BotMessage({
  message,
  className,
  isLoading,
  style
}: {
  message: string
  className?: string
  isLoading?: boolean
  style?: React.CSSProperties
}) {
  const [showSkeleton, setShowSkeleton] = useState(!message || message.length === 0);
  const [isFading, setIsFading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const skeletonHeight = useRef<number | null>(null);
  
  // Handle transition from skeleton to content
  useEffect(() => {
    if (message && message.length > 0) {
      // First set fading state to trigger fade animation
      setIsFading(true);
      
      // After fade animation, remove skeleton
      const timer = setTimeout(() => {
        if (contentRef.current && !skeletonHeight.current) {
          skeletonHeight.current = contentRef.current.clientHeight;
        }
        setShowSkeleton(false);
        setIsFading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(true);
      setIsFading(false);
    }
  }, [message]);

  // Check if the content contains LaTeX patterns
  const containsLaTeX = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/.test(
    message || ''
  )

  // Modify the content to render LaTeX equations if LaTeX patterns are found
  const processedData = preprocessLaTeX(message || '')

  // Add loading indicator at the end of the message
  const messageWithLoading = isLoading ? `${message}▍` : message

  // Initial skeleton loader with consistent height
  if (showSkeleton) {
    const skeletonClass = isFading ? 'skeleton-fade-out' : '';
    
    return (
      <div 
        ref={contentRef}
        className={`w-full mobile-message-container min-h-[60px] ${skeletonClass}`}
        style={skeletonHeight.current ? { minHeight: `${skeletonHeight.current}px` } : undefined}
      >
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/6" />
          {!message && <Skeleton className="h-5 w-3/4 mt-1" />}
        </div>
      </div>
    );
  }

  const contentClass = showSkeleton ? '' : 'content-fade-in';

  if (containsLaTeX) {
    return (
      <div ref={contentRef} className={`w-full overflow-x-auto mobile-message-container ${contentClass}`}>
        <MemoizedReactMarkdown
          rehypePlugins={[
            [rehypeExternalLinks, { target: '_blank' }],
            [rehypeKatex]
          ]}
          remarkPlugins={[remarkGfm, remarkMath]}
          className={cn(
            'prose-sm prose-neutral prose-a:text-accent-foreground/50 break-words',
            'max-w-full sm:max-w-none overflow-x-auto',
            className
          )}
        >
          {processedData}
        </MemoizedReactMarkdown>
      </div>
    )
  }

  return (
    <div ref={contentRef} className={`w-full overflow-x-auto mobile-message-container ${contentClass}`} style={style}>
      <MemoizedReactMarkdown
        rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
        remarkPlugins={[remarkGfm]}
        className={cn(
          'prose-sm prose-neutral prose-a:text-accent-foreground/50 break-words',
          'max-w-full sm:max-w-none overflow-x-auto',
          className
        )}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')

            return !inline ? (
              <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ''}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            ) : (
              <code className={cn('bg-zinc-200 dark:bg-zinc-800 rounded-md px-1 py-0.5', className)} {...props}>
                {children}
              </code>
            )
          },
          // Handle long pre text with scrolling
          pre({ node, children, ...props }) {
            return (
              <pre className="overflow-x-auto w-full max-w-full" {...props}>
                {children}
              </pre>
            )
          },
          img: ImageComponent,
        }}
      >
        {messageWithLoading}
      </MemoizedReactMarkdown>
    </div>
  )
}

// Image component with zoom functionality
function ImageComponent({ node, src, alt, ...props }: any) {
  const [error, setError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  if (error) {
    return (
      <span className="my-4 p-3 border border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50 dark:bg-zinc-900 block">
        <span className="text-sm text-red-500 block">Failed to load image: {src}</span>
        <span className="text-xs text-zinc-500 mt-1 block">{alt}</span>
      </span>
    );
  }
  
  return (
    <>
      <span className={`relative inline-block my-4 ${isZoomed ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/70' : ''}`}>
        <img 
          src={src} 
          alt={alt || 'Image'} 
          className={`
            rounded-md h-auto object-contain 
            ${isZoomed 
              ? 'max-h-screen max-w-full cursor-zoom-out p-4' 
              : 'max-w-full max-h-[400px] cursor-zoom-in border border-zinc-200 dark:border-zinc-800'
            }
          `}
          onClick={() => setIsZoomed(!isZoomed)}
          onError={() => setError(true)}
          loading="lazy"
          {...props}
        />
        {isZoomed && (
          <button 
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
            onClick={() => setIsZoomed(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </span>
      {alt && !isZoomed && <span className="text-xs text-center mt-1 text-muted-foreground block">{alt}</span>}
    </>
  );
}

// Preprocess LaTeX equations to be rendered by KaTeX
// ref: https://github.com/remarkjs/react-markdown/issues/785
const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$$${equation}$$`
  )
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation) => `$${equation}$`
  )
  return inlineProcessedContent
}
