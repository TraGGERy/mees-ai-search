'use client'

import { Text } from 'lucide-react'
import { CollapsibleMessage } from './collapsible-message'
import { DefaultSkeleton } from './default-skeleton'
import { ExportOptions } from './export-options'
import { BotMessage } from './message'
import { MessageActions } from './message-actions'

export type AnswerSectionProps = {
  content: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  chatId?: string
}

export function AnswerSection({
  content,
  isOpen,
  onOpenChange,
  chatId
}: AnswerSectionProps) {
  const enableShare = process.env.NEXT_PUBLIC_ENABLE_SHARE === 'true'

  const header = (
    <div className="flex items-center gap-1">
      <Text size={16} />
      <div>Answer</div>
    </div>
  )
  const message = content ? (
    <div className="flex flex-col gap-1">
      <BotMessage message={content} />
      <div className="flex justify-end items-center gap-2">
        <ExportOptions content={content} title="AI Research Report" />
        <MessageActions
          message={content}
          chatId={chatId}
          enableShare={enableShare}
          showFeedback={true}
        />
      </div>
    </div>
  ) : (
    <DefaultSkeleton />
  )
  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={false}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showBorder={false}
    >
      {message}
    </CollapsibleMessage>
  )
}
