'use client'

import { PromptType } from '@/lib/utils/prompts'
import { Check, Globe, GraduationCap, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import * as React from 'react'

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
    value: 'deepSearch', 
    label: 'Deep Search', 
    icon: Search,
    description: 'Comprehensive research with extensive sources and insights'
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
  const pathname = usePathname()
  
  // Check if we're on the home page
  const isHomePage = pathname === '/'
  
  // Find the current prompt label
  const currentPrompt = promptOptions.find(
    option => option.value === selectedPrompt
  )

  const handleSelect = (value: string) => {
    // Only allow selection on home page
    if (!isHomePage) return
    
    const newPromptType = value as PromptType
    setSelectedPrompt(newPromptType)
    
    // Call the parent's handler if it exists
    if (typeof onPromptTypeChange === 'function') {
      onPromptTypeChange(newPromptType)
    }
    
    setOpen(false)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover 
            open={isHomePage ? open : false} 
            onOpenChange={(value) => isHomePage && setOpen(value)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-[40px] h-[40px] p-0 flex items-center justify-center",
                  !isHomePage && "opacity-70 cursor-not-allowed"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  if (isHomePage) {
                    setOpen(!open)
                  }
                }}
                disabled={!isHomePage}
              >
                <div className="flex items-center justify-center">
                  {currentPrompt && (
                    <span className={cn(
                      "flex items-center justify-center rounded-full p-1.5",
                      currentPrompt.value === 'default' && "bg-blue-100 dark:bg-blue-900",
                      currentPrompt.value === 'academic' && "bg-green-100 dark:bg-green-900",
                      currentPrompt.value === 'deepSearch' && "bg-purple-100 dark:bg-purple-900"
                    )}>
                      {React.createElement(currentPrompt.icon, { 
                        className: cn(
                          "h-4 w-4",
                          currentPrompt.value === 'default' && "text-blue-600 dark:text-blue-400",
                          currentPrompt.value === 'academic' && "text-green-600 dark:text-green-400",
                          currentPrompt.value === 'deepSearch' && "text-purple-600 dark:text-purple-400"
                        )
                      })}
                    </span>
                  )}
                </div>
              </Button>
            </PopoverTrigger>
            {isHomePage && (
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
            )}
          </Popover>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-sm">{currentPrompt?.description || 'Select response style'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 