import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils'
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import React from 'react'
import HistoryContainer from './history-container'
import { PWAInstallButton } from './pwa-install-button'
import { IconLogo } from './ui/icons'
import { auth } from "@clerk/nextjs/server"
import { ModeToggle } from "./mode-toggle"

export const Header: React.FC = async () => {
  const { userId } = await auth()
  return (
    <header className="fixed w-full p-2 flex justify-between items-center z-10 backdrop-blur md:backdrop-blur-none bg-background/80 md:bg-transparent">
      <div>
        <a href="/">
          <IconLogo className={cn('w-5 h-5')} />
          <span className="sr-only">Mees ai</span>
        </a>
      </div>
      <div className="flex gap-0.5">
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          {!userId && (
            <>
              <SignInButton mode="modal">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-md dark:border-gray-700 dark:hover:border-gray-600"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  variant="outline"
                  size="sm" 
                  className="px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-md dark:border-gray-700 dark:hover:border-gray-600"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
       
        <HistoryContainer location="header" />
      </div>
    </header>
  )
}

export default Header
