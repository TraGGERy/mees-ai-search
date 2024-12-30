'use server'

import React from 'react'
import { History } from './history'
import { HistoryList } from './history-list'
import { currentUser } from '@clerk/nextjs/server'

type HistoryContainerProps = {
  location: 'sidebar' | 'header'
}

const HistoryContainer: React.FC<HistoryContainerProps> = async ({
  location
}) => {
  const user = await currentUser()
  
  return (
    <div
      className={location === 'header' ? 'block sm:hidden' : 'hidden sm:block'}
    >
      <History location={location}>
        <HistoryList userId={user?.id ?? 'anonymous'} />
      </History>
    </div>
  )
}

export default HistoryContainer
