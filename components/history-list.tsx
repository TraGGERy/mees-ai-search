'use client'

import { getChats, deleteChat } from '@/lib/actions/chat'
import { Chat } from '@/lib/types'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { LogIn, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { ClearHistory } from './clear-history'
import { SettingsMenu } from './settings-menu'
import { Button } from './ui/button'
import { HistorySkeleton } from './history-skeleton'
import HistoryItem from './history-item'
import { usePathname, useRouter } from 'next/navigation'

interface HistoryListProps {
  userId?: string; // Make userId optional since it can be undefined for non-authenticated users
}

const CACHE_DURATION = 60000 // 1 minute in milliseconds
const REFRESH_INTERVAL = 30000 // 30 seconds in milliseconds

type CacheData = {
  chats: Chat[]
  timestamp: number
}

export const HistoryList: React.FC<HistoryListProps> = ({ userId }) => {
  console.log('HistoryList - Component initialized with userId prop:', userId || 'undefined')
  
  // Get client-side auth state from Clerk
  const { user, isSignedIn } = useUser()
  
  // Determine if user is actually authenticated (both server and client side)
  const isUserAuthenticated = !!(userId && isSignedIn && user)
  
  console.log('HistoryList - Authentication state:', { 
    serverUserId: userId || 'undefined',
    clientIsSignedIn: isSignedIn,
    hasUserObject: !!user,
    isUserAuthenticated,
    userIdFromClient: user?.id || 'none',
    userEmail: user?.emailAddresses?.[0]?.emailAddress || 'none'
  })
  
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const renderChatItem = useCallback((chat: Chat) => {
    console.log('HistoryList - Rendering chat item:', { 
      id: chat.id, 
      title: chat.title || 'Untitled Chat',
      hasMessages: Array.isArray(chat.messages) && chat.messages.length > 0
    })
    
    return (
      <Link 
        key={chat.id} 
        href={`/search/${chat.id}`}
        prefetch={true}
        className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
      >
        {chat.title || 'Untitled Chat'}
      </Link>
    )
  }, [])

  const renderUserSection = useCallback(() => (
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
  ), [user])

  const getCachedData = useCallback((): CacheData | null => {
    try {
      const cachedData = sessionStorage.getItem('chat_history_cache')
      return cachedData ? JSON.parse(cachedData) : null
    } catch {
      return null
    }
  }, [])

  const setCachedData = useCallback((chats: Chat[]) => {
    const cacheData: CacheData = {
      chats,
      timestamp: Date.now()
    }
    sessionStorage.setItem('chat_history_cache', JSON.stringify(cacheData))
  }, [])

  const filterValidChats = useCallback((chats: Chat[]) => {
    return chats.filter((chat): chat is NonNullable<typeof chat> => chat !== null)
  }, [])

  const loadChats = useCallback(async () => {
    console.log('HistoryList - loadChats called with state:', { 
      isUserAuthenticated, 
      serverUserId: userId || 'undefined',
      clientIsSignedIn: isSignedIn 
    })
    
    try {
      // For non-authenticated users, use cached data if available and not expired
      if (!isUserAuthenticated) {
        console.log('HistoryList - User not authenticated, checking cache')
        const cachedData = getCachedData()
        const now = Date.now()

        if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
          console.log('HistoryList - Using cached data:', cachedData.chats.length, 'chats')
          setChats(filterValidChats(cachedData.chats))
          return
        } else {
          console.log('HistoryList - No valid cache for non-authenticated user, setting empty chats')
          setChats([])
          return
        }
      }

      setLoading(true)
      setError(null)

      console.log('HistoryList - Fetching chats from server for authenticated user:', { 
        isUserAuthenticated, 
        serverUserId: userId || 'undefined',
        hasUser: !!user,
        userEmail: user?.emailAddresses?.[0]?.emailAddress || 'none'
      })
      
      // Important: We're using the server-side auth in getChats(), not passing userId
      // This is intentional as the server-side auth is more secure
      const loadedChats = await getChats()
      console.log('HistoryList - Fetched chats from server:', {
        count: loadedChats?.length || 0,
        chatIds: loadedChats?.map(c => c.id).slice(0, 5) || []
      })
      
      const filteredChats = filterValidChats(loadedChats)
      console.log('HistoryList - Valid chats after filtering:', {
        count: filteredChats?.length || 0,
        chatIds: filteredChats?.map(c => c.id).slice(0, 5) || []
      })
      
      setChats(filteredChats)
      if (!isSignedIn) {
        setCachedData(filteredChats)
      }
    } catch (err: unknown) {
      console.error('HistoryList - Error loading chats:', err)
      console.log('HistoryList - Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack trace'
      })
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat history'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [isUserAuthenticated, getCachedData, setCachedData, filterValidChats, user, userId, isSignedIn])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await deleteChat(id)
      if (!result.error) {
        setChats(prev => prev.filter(chat => chat.id !== id))
        // If the current route is the deleted chat, redirect to home
        if (pathname === `/search/${id}`) {
          router.push('/')
        }
      } else {
        // Optionally show error toast
        alert(result.error)
      }
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    console.log('HistoryList - useEffect triggered with dependencies:', { 
      isUserAuthenticated, 
      serverUserId: userId || 'undefined',
      clientIsSignedIn: isSignedIn,
      userObject: !!user,
      userEmail: user?.emailAddresses?.[0]?.emailAddress || 'none'
    })
    
    let isSubscribed = true

    const fetchData = async () => {
      try {
        console.log('HistoryList - Fetching data in useEffect')
        await loadChats()
      } catch (err) {
        if (isSubscribed) {
          console.error('HistoryList - Error in background refresh:', err)
        }
      }
    }

    // Initial fetch
    fetchData()
    
    // Set up refresh interval for authenticated users
    let refreshInterval: NodeJS.Timeout | null = null
    if (isUserAuthenticated) {
      console.log(`HistoryList - Setting up refresh interval: ${REFRESH_INTERVAL}ms`)
      refreshInterval = setInterval(fetchData, REFRESH_INTERVAL)
    } else {
      console.log('HistoryList - No refresh interval (user not authenticated)')
    }
    
    // Cleanup function
    return () => {
      console.log('HistoryList - Cleaning up useEffect')
      isSubscribed = false
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [loadChats, isUserAuthenticated, userId, user, isSignedIn, REFRESH_INTERVAL])

  console.log('HistoryList - Rendering with state:', { 
    isUserAuthenticated, 
    serverUserId: userId || 'undefined',
    clientIsSignedIn: isSignedIn,
    hasUser: !!user, 
    loading, 
    error, 
    chatsCount: chats?.length || 0 
  })

  // If user is signed in but user object is not loaded yet, show loading state
  if (isSignedIn && !user) {
    console.log('HistoryList - User signed in but user object not loaded yet')
    return (
      <div className="flex flex-col flex-1 space-y-3 h-full">
        <div className="flex flex-col space-y-0.5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <div className="text-sm text-muted-foreground">Loading your chat history...</div>
          </div>
          <HistorySkeleton />
        </div>
        <div className="mt-auto border-t pt-4">
          {renderUserSection()}
          <ClearHistory empty={true} />
        </div>
      </div>
    )
  }

  if (!isUserAuthenticated) {
    console.log('HistoryList - User not authenticated, showing sign-in prompt')
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
      <div className="flex flex-col flex-1 space-y-3 h-full">
        <div className="flex flex-col space-y-0.5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <div className="text-sm text-muted-foreground">Loading chat history...</div>
          </div>
          <HistorySkeleton />
        </div>
        <div className="mt-auto border-t pt-4">
          {renderUserSection()}
          <ClearHistory empty={true} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 space-y-3 h-full">
        <div className="flex flex-col space-y-0.5 flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full p-4">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={loadChats}>
              Retry
            </Button>
          </div>
        </div>
        <div className="mt-auto border-t pt-4">
          {renderUserSection()}
          <ClearHistory empty={true} />
        </div>
      </div>
    )
  }

  console.log('HistoryList - Final render with chats:', { count: chats?.length || 0 })
  
  return (
    <div className="flex flex-col flex-1 space-y-3 h-full">
      <div className="flex flex-col space-y-0.5 flex-1 overflow-y-auto">
        {!chats?.length ? (
          <div className="text-foreground/30 text-sm text-center py-4">
            No search history
          </div>
        ) : (
          chats.map((chat, index) => {
            if (!chat) return null
            return (
              <div key={chat.id} className="relative">
                <HistoryItem
                  chat={chat}
                  onDelete={deletingId === chat.id ? undefined : handleDelete}
                />
                {deletingId === chat.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/40 z-10">
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      <div className="mt-auto border-t pt-4">
        {renderUserSection()}
        <ClearHistory empty={!chats?.length} />
      </div>
    </div>
  )
}
