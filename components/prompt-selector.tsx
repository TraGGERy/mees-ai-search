'use client'

import { PromptType } from '@/lib/utils/prompts'
import { Check, Globe, GraduationCap, Search, FileText, BookOpen, ClipboardList, Briefcase, MessageSquare, Beaker, Presentation, Info, Lock } from 'lucide-react'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { LoginModal } from './login-modal'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const promptOptions = [
  { 
    value: 'default', 
    label: 'Web', 
    icon: Globe,
    description: 'Balanced responses with moderate detail'
  },
  { 
    value: 'academic', 
    label: 'Academic', 
    icon: GraduationCap,
    description: 'Scholarly responses with citations and rigorous analysis'
  },
  { 
    value: 'assignment', 
    label: 'Assignment', 
    icon: Search,
    description: 'Comprehensive research with extensive sources and insights'
  },
  { 
    value: 'essayPlan', 
    label: 'Essay Plan', 
    icon: FileText,
    description: 'Structured outline for academic essays with research strategy'
  },
  { 
    value: 'researchReport', 
    label: 'Research Report', 
    icon: BookOpen,
    description: 'Comprehensive research report with methodology and findings'
  },
  { 
    value: 'literatureReview', 
    label: 'Literature Review', 
    icon: ClipboardList,
    description: 'Systematic review of academic literature with synthesis'
  },
  { 
    value: 'caseStudy', 
    label: 'Case Study', 
    icon: Briefcase,
    description: 'Detailed case analysis with methodology and findings'
  },
  { 
    value: 'debatePrep', 
    label: 'Debate Prep', 
    icon: MessageSquare,
    description: 'Strategic preparation for academic debates with evidence'
  },
  { 
    value: 'labReport', 
    label: 'Lab Report', 
    icon: Beaker,
    description: 'Structured laboratory report with methodology and results'
  },
  { 
    value: 'presentationOutline', 
    label: 'Presentation', 
    icon: Presentation,
    description: 'Comprehensive presentation outline with visual strategy'
  }
]

export function PromptSelector({
  promptType,
  onPromptTypeChange = () => {}
}: {
  promptType: PromptType
  onPromptTypeChange?: (type: PromptType) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedPrompt, setSelectedPrompt] = React.useState<PromptType>(promptType)
  const { isSignedIn, user } = useUser()
  const [isLoading, setIsLoading] = React.useState(false)
  const [loginModalOpen, setLoginModalOpen] = React.useState(false)
  
  // Find the current prompt label
  const currentPrompt = promptOptions.find(
    option => option.value === selectedPrompt
  )

  const handleSelect = async (value: string) => {
    // Check if the prompt requires login (all except 'default' which is 'web')
    if (value !== 'default' && !isSignedIn) {
      // Open login modal instead of just showing a toast
      setLoginModalOpen(true)
      // Don't change the prompt type - keep the current one
      setOpen(false)
      return
    }
    
    const newPromptType = value as PromptType
    setSelectedPrompt(newPromptType)
    
    // Call the parent's handler if it exists
    if (typeof onPromptTypeChange === 'function') {
      onPromptTypeChange(newPromptType)
    }
    
    setOpen(false)
  }

  const handleLockClick = (e: React.MouseEvent, option: { value: string, label: string }) => {
    e.stopPropagation()
    toast.info(`Please login first to use ${option.label} tool`, {
      duration: 3000,
      position: "top-center",
    })
  }

  return (
    <TooltipProvider>
      <div className="relative">
        <LoginModal 
          isOpen={loginModalOpen} 
          onClose={() => setLoginModalOpen(false)} 
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover 
              open={open} 
              onOpenChange={setOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-[40px] h-[40px] p-0 flex items-center justify-center relative"
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    setOpen(!open)
                  }}
                >
                  {currentPrompt && (
                    <span className={cn(
                      "flex items-center justify-center rounded-full p-1.5",
                      currentPrompt.value === 'default' && "bg-blue-100 dark:bg-blue-900",
                      currentPrompt.value === 'academic' && "bg-green-100 dark:bg-green-900",
                      currentPrompt.value === 'assignment' && "bg-purple-100 dark:bg-purple-900",
                      currentPrompt.value === 'essayPlan' && "bg-amber-100 dark:bg-amber-900",
                      currentPrompt.value === 'researchReport' && "bg-indigo-100 dark:bg-indigo-900",
                      currentPrompt.value === 'literatureReview' && "bg-teal-100 dark:bg-teal-900",
                      currentPrompt.value === 'caseStudy' && "bg-rose-100 dark:bg-rose-900",
                      currentPrompt.value === 'debatePrep' && "bg-cyan-100 dark:bg-cyan-900",
                      currentPrompt.value === 'labReport' && "bg-emerald-100 dark:bg-emerald-900",
                      currentPrompt.value === 'presentationOutline' && "bg-violet-100 dark:bg-violet-900"
                    )}>
                      {React.createElement(currentPrompt.icon, {
                        className: cn(
                          "h-4 w-4",
                          currentPrompt.value === 'default' && "text-blue-600 dark:text-blue-400",
                          currentPrompt.value === 'academic' && "text-green-600 dark:text-green-400",
                          currentPrompt.value === 'assignment' && "text-purple-600 dark:text-purple-400",
                          currentPrompt.value === 'essayPlan' && "text-amber-600 dark:text-amber-400",
                          currentPrompt.value === 'researchReport' && "text-indigo-600 dark:text-indigo-400",
                          currentPrompt.value === 'literatureReview' && "text-teal-600 dark:text-teal-400",
                          currentPrompt.value === 'caseStudy' && "text-rose-600 dark:text-rose-400",
                          currentPrompt.value === 'debatePrep' && "text-cyan-600 dark:text-cyan-400",
                          currentPrompt.value === 'labReport' && "text-emerald-600 dark:text-emerald-400",
                          currentPrompt.value === 'presentationOutline' && "text-violet-600 dark:text-violet-400"
                        )
                      })}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {promptOptions.map(option => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelect(option.value)}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-2">
                            {React.createElement(option.icon, { className: "h-4 w-4" })}
                            <span>{option.label}</span>
                            {option.value !== 'default' && !isSignedIn && (
                              <Lock 
                                className="h-3 w-3 text-purple-600 dark:text-purple-400 cursor-pointer" 
                                onClick={(e) => handleLockClick(e, option)}
                              />
                            )}
                          </div>
                          <Check
                            className={cn(
                              'ml-2 h-4 w-4',
                              selectedPrompt === option.value ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-sm">{currentPrompt?.description || 'Select response style'}</p>
            {currentPrompt?.value !== 'default' && !isSignedIn && (
              <p className="text-xs text-muted-foreground mt-1">Login required to use this tool</p>
            )}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 hover:bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="h-3 w-3 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[300px]">
            <p className="text-sm">Choose format of your answer. Great for essay, research reports, case study and more!</p>
            {!isSignedIn && (
              <p className="text-xs text-muted-foreground mt-1">Login required for advanced tools</p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}