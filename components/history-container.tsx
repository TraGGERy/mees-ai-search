import React from 'react'
import { History } from './history'
import { HistoryList } from './history-list'
import { auth } from '@clerk/nextjs/server'

type HistoryContainerProps = {
  location: 'sidebar' | 'header'
}

const HistoryContainer: React.FC<HistoryContainerProps> = async ({
  location
}) => {
  const enableSaveChatHistory =
    process.env.NEXT_PUBLIC_ENABLE_SAVE_CHAT_HISTORY === 'true'
  if (!enableSaveChatHistory) {
    console.log('HistoryContainer - Chat history saving is disabled')
    return null
  }

  // Get full auth result to debug
  const authResult = await auth()
  console.log('HistoryContainer - Full auth result:', authResult)
  
  // Extract userId with proper fallback
  const { userId } = authResult || {}
  console.log('HistoryContainer - Auth userId:', userId)

  // Pass the actual userId (or undefined for non-authenticated users)
  // The HistoryList component will handle the authentication state properly
  console.log('HistoryContainer - Passing userId to HistoryList:', userId || 'undefined')

  return (
    <div
      className={location === 'header' ? 'block lg:hidden' : 'hidden sm:block'}
    >
      <History location={location}>
        <HistoryList userId={userId || undefined} />
      </History>
    </div>
  )
}

export default HistoryContainer