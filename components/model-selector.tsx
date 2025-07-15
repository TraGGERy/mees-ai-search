'use client'

import { Model } from '@/lib/types/models'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import { isReasoningModel } from '@/lib/utils/registry'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Check, ChevronsUpDown, Lightbulb } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createModelId } from '../lib/utils'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

function groupModelsByProvider(models: Model[], isAuthenticated: boolean) {
  return models
    .filter(model => model.enabled && (!model.requiresAuth || isAuthenticated))
    .reduce((groups, model) => {
      const provider = model.provider
      if (!groups[provider]) {
        groups[provider] = []
      }
      groups[provider].push(model)
      return groups
    }, {} as Record<string, Model[]>)
}

interface ModelSelectorProps {
  models: Model[]
}

export function ModelSelector({ models }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const { isAuthenticated } = useCurrentUser()

  useEffect(() => {
    const savedModel = getCookie('selectedModel')
    if (savedModel) {
      try {
        const model = JSON.parse(savedModel) as Model
        setValue(createModelId(model))
      } catch (e) {
        console.error('Failed to parse saved model:', e)
      }
    }
  }, [])

  const handleModelSelect = (id: string) => {
    const newValue = id === value ? '' : id
    setValue(newValue)
    
    const selectedModel = models.find(model => createModelId(model) === newValue)
    if (selectedModel) {
      setCookie('selectedModel', JSON.stringify(selectedModel))
    } else {
      setCookie('selectedModel', '')
    }
    
    setOpen(false)
  }

const availableModels = models.filter(model => 
    !model.requiresAuth || isAuthenticated
  );

  const hasAuthRequiredModels = models.some(model => model.requiresAuth && !isAuthenticated);const selectedModel = availableModels.find(model => createModelId(model) === value)
  const groupedModels = groupModelsByProvider(models, isAuthenticated)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="text-sm rounded-full shadow-none focus:ring-0"
        >
          {selectedModel ? (
            <div className="flex items-center space-x-1">
              <Image
                src={`/providers/logos/${selectedModel.providerId}.svg`}
                alt={selectedModel.provider}
                width={18}
                height={18}
                className="bg-white rounded-full border"
              />
              <span className="text-xs font-medium">{selectedModel.name}</span>
              {isReasoningModel(selectedModel.id) && (
                <Lightbulb size={12} className="text-accent-blue-foreground" />
              )}
            </div>
          ) : (
            'Select model'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            {Object.entries(groupedModels).map(([provider, models]) => (
              <CommandGroup key={provider} heading={provider}>
                {models.map(model => {
                  const modelId = createModelId(model)
                  const isDisabled = model.requiresAuth && !isAuthenticated
                  return (
                    <CommandItem
                      key={modelId}
                      value={modelId}
                      onSelect={() => {
                         if (!isDisabled) {
                           setValue(modelId)
                           setOpen(false)
                         }
                       }}
                      className={`flex justify-between ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isDisabled}
                    >
                      <div className="flex items-center space-x-2">
                        <Image
                          src={`/providers/logos/${model.providerId}.svg`}
                          alt={model.provider}
                          width={18}
                          height={18}
                          className="bg-white rounded-full border"
                        />
                        <span className="text-xs font-medium">
                          {model.name}
                        </span>
                        {model.requiresAuth && !isAuthenticated && (
                          <span className="text-xs text-muted-foreground">🔒</span>
                        )}
                      </div>
                      <Check
                        className={`h-4 w-4 ${
                          value === modelId ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
        {hasAuthRequiredModels && (
          <div className="mt-2 p-2 text-xs text-muted-foreground border-t">
            💡 Please <strong>log in</strong> to access premium models like ThoughtfulAI, CreativeGenius Pro, and CuriosityAI Research
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
