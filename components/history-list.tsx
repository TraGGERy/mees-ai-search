'use client'

import { getChats } from '@/lib/actions/chat'
import { Chat } from '@/lib/types'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { LogIn } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true)
        setError(null)
        const loadedChats = await getChats()
        setChats(loadedChats.filter((chat): chat is Chat => chat !== null))
      } catch (err) {
        console.error('Error loading chats:', err)
        setError('Failed to load chat history')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadChats()
    }
  }, [user])

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
                className="block p-2 hover:bg-gray-500"
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
