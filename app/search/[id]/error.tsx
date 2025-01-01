'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ErrorBoundary({
  error
}: {
  error: Error & { digest?: string }
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Search page error:', error)
  }, [error])

  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold">Something went wrong!</h2>
      <button
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={() => router.push('/')}
      >
        Return Home
      </button>
    </div>
  )
} 