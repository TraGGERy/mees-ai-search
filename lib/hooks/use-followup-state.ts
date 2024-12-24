import { useLocalStorage } from './use-local-storage'
import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'

export function useFollowupState() {
  const [followupCount, setFollowupCount] = useLocalStorage<number>('followupCount', 0)
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      setFollowupCount(0)
    }
  }, [isSignedIn, setFollowupCount])

  const incrementFollowupCount = () => {
    if (!isSignedIn) {
      setFollowupCount(followupCount + 1)
    }
  }

  const hasReachedLimit = !isSignedIn && followupCount >= 3
  const remainingQuestions = 3 - followupCount

  return {
    followupCount,
    setFollowupCount,
    incrementFollowupCount,
    hasReachedLimit,
    remainingQuestions,
    isSignedIn
  }
} 