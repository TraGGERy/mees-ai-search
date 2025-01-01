'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to your analytics service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="mt-4 text-gray-600">
        {error.message || 'An unexpected error occurred'}
      </p>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={reset}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Go home
        </Link>
      </div>
    </div>
  )
} 