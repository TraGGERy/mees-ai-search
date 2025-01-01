'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Search page error:', error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Unable to load chat</h2>
      <div className="mt-4 flex space-x-4">
        <button
          onClick={() => router.push('/')}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-900 hover:bg-gray-200"
        >
          Return Home
        </button>
        <button
          onClick={() => reset()}
          className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 