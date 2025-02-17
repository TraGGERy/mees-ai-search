'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { Loader2, Settings, User } from 'lucide-react'

export function SidebarActions() {
  const { user, isLoaded } = useUser()

  return (
    <div className="flex items-center gap-2 p-4 border-t bg-muted/50">
      <Avatar className="h-8 w-8">
        {!isLoaded ? (
          <AvatarFallback>
            <Loader2 className="h-4 w-4 animate-spin" />
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>
              <User className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {!isLoaded ? 'Loading...' : (user?.fullName || 'Anonymous User')}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {!isLoaded ? '' : (user?.primaryEmailAddress?.emailAddress || 'Not signed in')}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => window.location.href = '/settings'}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
} 