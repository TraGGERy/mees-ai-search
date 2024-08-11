import React from 'react'
import { ModeToggle } from './mode-toggle'
import { IconLogo } from './ui/icons'
import { cn } from '@/lib/utils'
import HistoryContainer from './history-container'
import { Avatar } from './ui/avatar'
import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Button } from './ui/button'

export const Header: React.FC = async () => {
  return (
    <header className="fixed w-full p-1 md:p-2 flex justify-between items-center z-10 backdrop-blur md:backdrop-blur-none bg-background/80 md:bg-transparent">
      <div>
        <a href="/">
          <IconLogo className={cn('w-5 h-5')} />
          <span className="sr-only">Mees Ai</span>
        </a>
      </div>
      
      <Avatar>
             <AvatarImage src="ai.jpeg" >

             </AvatarImage>
            <AvatarFallback>Ai</AvatarFallback>
      </Avatar>

      
      <div className="flex gap-0.5"><button className="shadow-[0_0_0_3px_#000000_inset] px-2 py-2 bg-transparent border border-black dark:border-white dark:text-white text-black rounded-lg font-bold transform hover:-translate-y-1 transition duration-400">
        <a href='/news'>blog</a>
      </button>
        <ModeToggle />
        <HistoryContainer location="header" />
      </div>
    </header>
  )
}

export default Header
