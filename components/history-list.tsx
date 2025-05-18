'use client'

import { getChats } from '@/lib/actions/chat'
import { Chat } from '@/lib/types'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { LogIn } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { ClearHistory } from './clear-history'
import { SettingsMenu } from './settings-menu'
import { Button } from './ui/button'

interface HistoryListProps {
  userId: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({ userId }) => {
  const { user } = useUser()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use memoization to prevent unnecessary re-fetches
  const loadChats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if we have cached data in sessionStorage
      const cachedChats = sessionStorage.getItem('cached_chat_history')
      const cachedTimestamp = sessionStorage.getItem('cached_chat_timestamp')
      const now = Date.now()
      
      // Use cached data if it exists and is less than 1 minute old
      if (cachedChats && cachedTimestamp && (now - parseInt(cachedTimestamp) < 60000)) {
        setChats(JSON.parse(cachedChats).filter((chat): chat is Chat => chat !== null))
        setLoading(false)
        
        // Refresh in background after using cache
        getChats().then(loadedChats => {
          const filteredChats = loadedChats.filter((chat): chat is Chat => chat !== null)
          setChats(filteredChats)
          sessionStorage.setItem('cached_chat_history', JSON.stringify(filteredChats))
          sessionStorage.setItem('cached_chat_timestamp', now.toString())
        }).catch(console.error)
      } else {
        // No valid cache, load directly
        const loadedChats = await getChats()
        const filteredChats = loadedChats.filter((chat): chat is Chat => chat !== null)
        setChats(filteredChats)
        
        // Cache the results
        sessionStorage.setItem('cached_chat_history', JSON.stringify(filteredChats))
        sessionStorage.setItem('cached_chat_timestamp', now.toString())
      }
    } catch (err) {
      console.error('Error loading chats:', err)
      setError('Failed to load chat history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadChats()
    }
  }, [user, loadChats])

  // If user is not logged in, show sign in prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Sign in to view your chat history
        </p>
        <SignInButton mode="modal">
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            Sign in
          </Button>
        </SignInButton>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 space-y-3 h-full">
      <div className="flex flex-col space-y-0.5 flex-1 overflow-y-auto">
        {!chats?.length ? (
          <div className="text-foreground/30 text-sm text-center py-4">
            No search history
          </div>
        ) : (
          chats?.map(
            (chat: Chat) => chat && (
              <Link 
                key={chat.id} 
                href={`/search/${chat.id}`}
                prefetch={true}
                className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                {chat.title || 'Untitled Chat'}
              </Link>
            )
          )
        )}
      </div>
      <div className="mt-auto border-t pt-4">
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user?.fullName || 'Guest'}
              </span>
            </div>
          </div>
          <SettingsMenu t={undefined} />
        </div>
        <ClearHistory empty={!chats?.length} />
      </div>
    </div>
  )
}
