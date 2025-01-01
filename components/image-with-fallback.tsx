'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  fallbackSrc,
}: {
  src: string
  alt: string
  width: number
  height: number
  fallbackSrc?: string
}) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative">
      {/* Skeleton */}
      {isLoading && !isError && (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse"
             style={{ width, height }}>
          <span className="text-gray-400">Loading...</span>
        </div>
      )}

      {/* Error UI */}
      {isError && (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-red-500"
             style={{ width, height }}>
          <span>Could not load image.</span>
        </div>
      )}

      {/* Actual Image (hidden if error) */}
      {!isError && (
        <Image
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            if (fallbackSrc) {
              setImgSrc(fallbackSrc)
            } else {
              setIsError(true)
            }
          }}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          // Optionally add layout="fixed" or "responsive"
          // and set placeholder="blur" if using a blur placeholder
        />
      )}
    </div>
  )
} 