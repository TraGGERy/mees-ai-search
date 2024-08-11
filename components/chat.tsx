'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ChatPanel } from './chat-panel'
import { ChatMessages } from './chat-messages'
import { useUIState } from 'ai/rsc'
import { FlipWords } from "./ui/flip-words";

type ChatProps = {
  id?: string
  query?: string
}

export function Chat({ id, query }: ChatProps) {
  const path = usePathname()
  const [messages] = useUIState()
  const words = ["Research", "Learn", "Explore", "Achieve", "Anywhere"];

  useEffect(() => {
    if (!path.includes('search') && messages.length === 1) {
      window.history.replaceState({}, '', `/search/${id}`)
    }
  }, [id, path, messages, query])

  return (
    <div className="px-8 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-3xl mx-auto flex flex-col space-y-3 md:space-y-4">
      <br></br>
      <center>
      <div className="h-[1rem] flex justify-center items-center px-4">
      <div className="text-1xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
        Mees Ai
        <FlipWords words={words} /> <br />
      
      </div>
    </div>        
      </center>
      <br></br>
      <ChatMessages messages={messages} />
      <ChatPanel messages={messages} query={query} />
    </div>
  )
}
