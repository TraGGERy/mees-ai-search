'use client'

import { useEffect, useState } from 'react'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { toast } from 'sonner'
import { AiOutlineSound, AiOutlineCopy, AiOutlineLike, AiOutlineDislike, AiOutlineSync, AiOutlineDown, AiOutlineStop } from "react-icons/ai"
import { IconSearch } from '@tabler/icons-react'
import { Section } from './section'
import { BotMessage } from './message'
import { DefaultSkeleton } from './default-skeleton'
import { FeedbackPopup } from './feedback-popup'

export type AnswerSectionProps = {
  result?: StreamableValue<string>
  hasHeader?: boolean
}

let currentUtterance: SpeechSynthesisUtterance | null = null; // Tracks the current speech

export function AnswerSection({ result, hasHeader = true }: AnswerSectionProps) {
  const [data, error, pending] = useStreamableValue(result)
  const [content, setContent] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [likes, setLikes] = useState<number>(0)
  const [dislikes, setDislikes] = useState<number>(0)
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike' | null>(null)

  useEffect(() => {
    if (!data) return
    setContent(data)
  }, [data])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Text copied to clipboard'))
      .catch(() => toast.error('Failed to copy text'))
  }

  const extractText = (text: string) => text // Assuming the entire content is the text you want

  const extractImageUrls = (text: string) => [] // Return an array of image URLs

  const handleCopy = () => {
    if (content) {
      const text = extractText(content)
      const imageUrls = extractImageUrls(content)
      const combinedContent = `${text}\n\nImages:\n${imageUrls.join('\n')}`
      copyToClipboard(combinedContent)
    } else {
      toast.error('No Text To Copy')
    }
  }

  const readAloud = (text: string) => {
    // Stop any ongoing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // Create a new utterance and speak
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.onend = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    speechSynthesis.speak(currentUtterance);
  }

  const stopAudio = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }

  const handleRead = () => {
    if (content) {
      const text = extractText(content)
      readAloud(text)
    } else {
      toast.error('No Text To Read')
    }
  }

  const handleFeedbackClick = (type: 'like' | 'dislike') => {
    setFeedbackType(type)
  }

  const handleFeedbackSubmit = (feedback: string, isChecked: boolean) => {
    if (feedbackType === 'like') {
      setLikes(likes + 1)
    } else {
      setDislikes(dislikes + 1)
    }
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', { type: feedbackType, feedback, isChecked })
    toast.success('Thank you for your feedback!')
    setFeedbackType(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {content.length > 0 ? (
        <Section title={hasHeader ? 'Answer' : undefined}>
          <div className="flex items-center space-x-2 mb-4">
            <IconSearch className="h-5 w-5 text-green-500" />
            <p className="font-medium text-gray-700 dark:text-gray-300">Mees AI Research</p>
          </div>
          
          <BotMessage content={content} />
    
          <div className="mt-6 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-light">
                Mees AI: can make mistakes. Check important info.
              </p>
              
              <div className="flex space-x-2 items-center">
                <button
                  onClick={isPlaying ? stopAudio : handleRead}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  {isPlaying ? (
                    <AiOutlineStop className="h-5 w-5" />
                  ) : (
                    <AiOutlineSound className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  <AiOutlineCopy className="h-5 w-5" />
                </button>

                <button
                  onClick={() => handleFeedbackClick('like')}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  <AiOutlineLike className="h-5 w-5" />
                </button>

                <button
                  onClick={() => handleFeedbackClick('dislike')}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  <AiOutlineDislike className="h-5 w-5" />
                </button>

                <button
                  onClick={() => {}}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  <AiOutlineSync className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </Section>
      ) : (
        <DefaultSkeleton />
      )}

      <button
        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        className="fixed bottom-24 right-4 sm:right-8 bg-black/10 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full p-3 hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-200 ease-in-out z-50 shadow-lg"
        aria-label="Scroll to bottom"
      >
        <AiOutlineDown className="h-6 w-6" />
      </button>

      <FeedbackPopup
        isOpen={feedbackType !== null}
        onClose={() => setFeedbackType(null)}
        onSubmit={handleFeedbackSubmit}
        type={feedbackType || 'like'}
      />
    </div>
  )
}
