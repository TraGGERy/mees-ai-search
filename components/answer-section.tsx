'use client'

import { Section } from './section'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { BotMessage } from './message'
import { useEffect, useState } from 'react'
import { DefaultSkeleton } from './default-skeleton'
import { IconCopy, IconCopyX, IconPlayerTrackNext, IconSearch } from '@tabler/icons-react'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { toast } from 'sonner'
import { any } from 'zod'
import { convertToCoreMessages } from 'ai'



export type AnswerSectionProps = {
  result?: StreamableValue<string>
  hasHeader?: boolean
}

export function AnswerSection({
  result,
  hasHeader = true
}: AnswerSectionProps) {
  const [data, error, pending] = useStreamableValue(result)
  const [content, setContent] = useState<string>('')
const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 })
const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!data) return
    setContent(data)
  }, [data])

  const handleCopy = () => {
    const text = <BotMessage content={content} />
    const easy = JSON.stringify(text.props.content);

    if (<BotMessage content={content} />) {
      copyToClipboard(easy)
      
      toast.success('Link copied to clipboard')
      setOpen(false)
    } else {
      toast.error('No Text To Copy')
    }
  }

  return (
    <div>
      {content.length > 0 ? (
        <Section title={hasHeader ? 'Answer' : undefined}>
          <div className='flex items-stretch'>
           <IconSearch className='mr-0 h-4 w-5 mt-1  text-green-400'/><p className='flex font-light text-sm'>Mees Ai Research</p></div>
          <BotMessage content={content} />

          <div className='flex justify-end '><IconCopy className='mr-1 h-5 w-8 mt-1  text-purple-700' onClick={handleCopy}/></div>
        </Section>
      ) : (
        <DefaultSkeleton />
      )}
    </div>
  )
}
