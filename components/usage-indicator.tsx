'use client'

import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useUser } from '@clerk/nextjs'

interface UsageIndicatorProps {
  className?: string
}

export function UsageIndicator({ className }: UsageIndicatorProps) {
  const { user, isLoaded } = useUser()
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false)
      return
    }

    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/user/usage')
        if (response.ok) {
          const data = await response.json()
          setRemaining(data.remaining)
        }
      } catch (error) {
        console.error('Error fetching usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [user, isLoaded])

  if (loading || remaining === null || !user) {
    return null
  }

  // If user has unlimited usage (subscriber), don't show the indicator
  if (remaining === Infinity) {
    return null
  }

  const getColor = () => {
    if (remaining > 5) return 'bg-green-100 text-green-800 hover:bg-green-200'
    if (remaining > 2) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    return 'bg-red-100 text-red-800 hover:bg-red-200'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getColor()} cursor-help ${className}`}>
            {remaining} Pro Search
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>You have {remaining} free advanced searches remaining today.</p>
          <p className="text-xs mt-1">Upgrade for unlimited access.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 