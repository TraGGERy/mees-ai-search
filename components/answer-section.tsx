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
      const text = extractText(content);
      const imageUrls = extractImageUrls(content);

      const combinedContent = `${text}\n\nImages:\n${imageUrls.join('\n')}`;

      copyToClipboard(combinedContent)
      
      toast.success('Text copied to clipboard')
      setOpen(false)
    } else {
      toast.error('No Text To Copy')
    }
  }

  // Function to extract text from content (replace with your actual method)
const text = <BotMessage content={content} />
const easy = JSON.stringify(text.props.content);
const extractText = (content=easy) => {
  // Assuming content is a JSX element, convert it to a string
  return typeof content === 'string' ? content : content || '';
}

// Function to extract image URLs from content (replace with your actual method)
const extractImageUrls = (content= easy) => {
  // Extract image URLs from content
  // Assuming content is an array of JSX elements
  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'img')
      .map(img => img.props.src || '');
  }
  return [];
}

  return (
    <div>
      {content.length > 0 ? (
        <Section title={hasHeader ? 'Answer' : undefined}>
          <div className='flex items-stretch'>
           <IconSearch className='mr-0 h-4 w-5 mt-1  text-green-400'/><p className='flex font-light text-sm'>Mees Ai Research</p></div>
          <BotMessage content={content} />

          <div className='flex justify-end items-stretch'>
            <IconCopy className='mr-1 h-5 w-8 mt-1 active:bg-gray-700 focus:outline-none text-purple-700 rounded-md hover:bg-green-600' onClick={handleCopy}/>
            <IconCopy className='mr-1 h-5 w-8 mt-1 active:bg-gray-700 focus:outline-none text-purple-700 rounded-md hover:bg-green-600' onClick={handleCopy}/>
          </div>
        </Section>
      ) : (
        <DefaultSkeleton />
      )}
    </div>
  )
}
