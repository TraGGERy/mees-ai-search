'use client'

import { LoginModal } from '@/components/login-modal'
import { UsageWarning } from '@/components/usage-warning'
import { cn } from '@/lib/utils'
import { PromptType } from '@/lib/utils/prompts'
import { useUser } from '@clerk/nextjs'
import { Message } from 'ai'
import { ArrowUp, MessageCirclePlus, Share, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { toast } from 'sonner'
import { EmptyScreen } from './empty-screen'
import { ModelSelector } from './model-selector'
import { PromptSelector } from './prompt-selector'
import { SearchModeToggle } from './search-mode-toggle'
import { Button } from './ui/button'
import { UsageIndicator } from './usage-indicator'

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: Message) => Promise<string | null | undefined>
  id: string
  selectedModel?: { requiresLogin?: boolean }
  reload: () => Promise<string | null | undefined>
  promptType: PromptType
  onPromptTypeChange: (type: PromptType) => void
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit: onSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  id,
  selectedModel,
  reload,
  promptType,
  onPromptTypeChange
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { isSignedIn } = useUser()
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null)
  const [showUsageWarning, setShowUsageWarning] = useState(false)

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    router.push('/')
  }

  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      append({
        role: 'user',
        content: query,
        id: crypto.randomUUID()
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/user/usage')
        if (response.ok) {
          const data = await response.json()
          setUsageRemaining(data.remaining)
        }
      } catch (error) {
        console.error('Error fetching usage:', error)
      }
    }

    if (isSignedIn) {
      fetchUsage()
    }
  }, [isSignedIn])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isComposing) return

    // Check if the selected model requires login
    const modelRequiresLogin = selectedModel?.requiresLogin;
    
    if (modelRequiresLogin && !isSignedIn) {
      setLoginModalOpen(true)
      return
    }

    onSubmit(e)
  }

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/share?id=${id}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to share chat')
      }

      const data = await response.json()
      const shareUrl = `${window.location.origin}/share/${id}`

      if (navigator.share) {
        await navigator.share({
          title: 'Shared Chat',
          text: 'Check out this chat!',
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Share link copied to clipboard')
      }
    } catch (error) {
      toast.error('Failed to share chat')
    }
  }

  const handleUpgradeClick = () => {
    // Add your upgrade logic here
    setShowUsageWarning(false)
  }

  return (
    <>
      <div
        className={cn(
          'mx-auto w-full',
          messages.length > 0
            ? 'fixed bottom-0 left-0 right-0 bg-background'
            : 'fixed bottom-8 left-0 right-0 top-6 flex flex-col items-center justify-center'
        )}
      >
        {messages.length === 0 && (
          <div className="mb-8 flex flex-col items-center gap-2">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-purple-500 from-black to-gray-500">
              Mees AI
            </h1>
            <p className="text-sm text-center text-muted-foreground">
              Your intelligent companion for precise and personalized search results
            </p>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className={cn(
            'max-w-3xl w-full mx-auto',
            messages.length > 0 ? 'px-2 py-4' : 'px-6'
          )}
        >
          <div className="relative flex flex-col w-full gap-2 bg-muted rounded-3xl border border-input">
            {usageRemaining !== null && usageRemaining !== Infinity && (
              <div className="absolute -top-8 right-0">
                <UsageIndicator className="mr-2" />
              </div>
            )}
            
            {/* Usage Warning Modal */}
            {showUsageWarning && (
              <UsageWarning 
                onClose={() => setShowUsageWarning(false)}
                onUpgrade={handleUpgradeClick}
              />
            )}
            
            <Textarea
              ref={inputRef}
              name="input"
              rows={2}
              maxRows={5}
              tabIndex={0}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="Ask a question..."
              spellCheck={false}
              value={input}
              className="resize-none w-full min-h-12 bg-transparent border-0 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onChange={e => {
                handleInputChange(e)
                setShowEmptyScreen(e.target.value.length === 0)
              }}
              onKeyDown={e => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !isComposing &&
                  !enterDisabled
                ) {
                  if (input.trim().length === 0) {
                    e.preventDefault()
                    return
                  }
                  e.preventDefault()
                  const textarea = e.target as HTMLTextAreaElement
                  textarea.form?.requestSubmit()
                }
              }}
              onFocus={() => setShowEmptyScreen(true)}
              onBlur={() => setShowEmptyScreen(false)}
            />

            {/* Bottom menu area */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <ModelSelector />
                <SearchModeToggle />
                <PromptSelector 
                  promptType={promptType} 
                  onPromptTypeChange={(type) => onPromptTypeChange(type)} 
                />
                
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNewChat}
                    className="shrink-0 rounded-full group"
                    type="button"
                    disabled={isLoading}
                  >
                    <MessageCirclePlus className="size-4 group-hover:rotate-12 transition-all" />
                  </Button>
                )}
                <Button
                  type={isLoading ? 'button' : 'submit'}
                  size={'icon'}
                  variant={'outline'}
                  className={cn(isLoading && 'animate-pulse', 'rounded-full')}
                  disabled={input.length === 0 && !isLoading}
                  onClick={isLoading ? stop : undefined}
                >
                  {isLoading ? <Square size={20} /> : <ArrowUp size={20} />}
                </Button>
              </div>
            </div>
          </div>

          {messages.length === 0 && (
            <EmptyScreen
              submitMessage={message => {
                handleInputChange({
                  target: { value: message }
                } as React.ChangeEvent<HTMLTextAreaElement>)
              }}
              className={cn(showEmptyScreen ? 'visible' : 'invisible')}
            />
          )}
        </form>
      </div>
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
        {usageRemaining !== null && usageRemaining !== Infinity && usageRemaining <= 3 && (
          <div className="mx-auto sm:max-w-2xl sm:px-4 mb-4">
            <UsageWarning remaining={usageRemaining} />
          </div>
        )}
        
      </div>
    </>
  )
}
