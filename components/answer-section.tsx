'use client'

import { useEffect, useState } from 'react'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { toast } from 'sonner'
import { AiOutlineSound, AiOutlineCopy, AiOutlineLike, AiOutlineDislike, AiOutlineSync, AiOutlineDown, AiOutlineStop, AiOutlineDownload } from "react-icons/ai"
import { IconSearch } from '@tabler/icons-react'
import { Section } from './section'
import { BotMessage } from './message'
import { DefaultSkeleton } from './default-skeleton'
import { FeedbackPopup } from './feedback-popup'
import { html2pdf } from 'html2pdf.js';

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
  const [isGenerating, setIsGenerating] = useState(false);

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

  const extractImageUrls = (text: string): string[] => {
    const imgRegex = /https?:\/\/[^\s<>"]+?\.(?:jpg|jpeg|gif|png|webp)(?:\?[^\s<>"]*)?/g;
    return text.match(imgRegex) || [];
  };

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

  const formatContent = (text: string): string => {
    // First, clean any existing style strings that might be in the content
    const cleanedText = text.replace(/\d{6}eb; margin:[^"]*"/g, '');

    return cleanedText
      // Format headers properly
      .replace(/###\s*(.*?)\s*\n/g, (_, title) => 
        `<h3 class="heading-3">${title}</h3>`)
      .replace(/##\s*(.*?)\s*\n/g, (_, title) => 
        `<h2 class="heading-2">${title}</h2>`)
      .replace(/#\s*(.*?)\s*\n/g, (_, title) => 
        `<h1 class="heading-1">${title}</h1>`)
      // Format bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Format paragraphs
      .split('\n')
      .map(para => para.trim())
      .filter(para => para.length > 0)
      .map(para => `<p class="paragraph">${para}</p>`)
      .join('');
  };

  const downloadAsDoc = async () => {
    if (isGenerating || !content) return;
    
    setIsGenerating(true);
    const loadingToast = toast.loading('Preparing document...');
    
    try {
      const images = extractImageUrls(content);
      const formattedContent = formatContent(content);
      
      const docContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Mees AI Response</title>
          <style>
            .heading-1 { color: #1e40af; margin: 30px 0 20px; font-size: 1.8em; }
            .heading-2 { color: #1d4ed8; margin: 25px 0 15px; font-size: 1.5em; }
            .heading-3 { color: #2563eb; margin: 20px 0 10px; font-size: 1.3em; }
            .paragraph { margin-bottom: 15px; line-height: 1.6; }
            strong { color: #2563eb; }
            em { color: #4b5563; }
            /* ... rest of styles ... */
          </style>
        </head>
        <body>
          <div class='header'>
            <h1 style='color: #2563eb; font-size: 24px;'>Mees AI Response</h1>
            <p style='color: #666;'>${new Date().toLocaleString()}</p>
          </div>
          
          <div class='content'>
            ${formattedContent}
          </div>
          
          ${images.length > 0 ? `
            <div class='image-container'>
              ${images.map(url => 
                `<img src="${url}" alt="Generated content" style="border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />`
              ).join('')}
            </div>
          ` : ''}
          
          <div class='footer'>
            <p style='color: #666; font-size: 12px;'>Generated by Mees AI</p>
            <p style='color: #666; font-size: 12px;'>© ${new Date().getFullYear()} Mees AI. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

      // Convert to Blob
      const blob = new Blob([docContent], { type: 'application/msword' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `MeesAI-Response-${new Date().toISOString().slice(0,10)}.doc`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Make sure to dismiss the loading toast before showing success
      toast.dismiss(loadingToast);
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Document generation failed:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to generate document');
    } finally {
      setIsGenerating(false); // Reset generating state
    }
  };

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

                <button
                  onClick={downloadAsDoc}
                  disabled={isGenerating}
                  className={`p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors duration-200 ${
                    isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={isGenerating ? 'Generating document...' : 'Download as DOC'}
                >
                  <AiOutlineDownload className="h-5 w-5" />
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
