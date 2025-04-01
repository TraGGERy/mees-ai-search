'use client'
//client
import { Model, models } from '@/lib/types/models'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import { isReasoningModel } from '@/lib/utils/registry'
import { Check, ChevronsUpDown, Lightbulb, Microscope, Target, Zap } from 'lucide-react'
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

function groupModelsByProvider(models: Model[]) {
  return models.reduce((groups, model) => {
    const provider = model.provider
    if (!groups[provider]) {
      groups[provider] = []
    }
    groups[provider].push(model)
    return groups
  }, {} as Record<string, Model[]>)
}

const getModelIcon = (model: Model) => {
  switch (model.providerId) {
    case 'fireworks':
    case 'deepseek':
      return <Lightbulb size={18} className="text-amber-500" />
    case 'anthropic':
      return <Target size={18} className="text-blue-500" />
    case 'google':
      return <Microscope size={18} className="text-emerald-500" />
    case 'openai':
      return <Zap size={18} className="text-violet-500" />
    default:
      return <Zap size={18} className="text-gray-500" />
  }
}

export function ModelSelector() {
  const [open, setOpen] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string>('')

  useEffect(() => {
    const savedModel = getCookie('selected-model')
    if (savedModel) {
      setSelectedModelId(savedModel)
    }
  }, [])

  const handleModelSelect = (id: string) => {
    setSelectedModelId(id === selectedModelId ? '' : id)
    setCookie('selected-model', id)
    setOpen(false)
  }

  const groupedModels = groupModelsByProvider(models)
  const selectedModel = models.find(m => createModelId(m) === selectedModelId)

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
              {getModelIcon(selectedModel)}
              <span className="text-xs font-medium">{selectedModel.name}</span>
              {isReasoningModel(selectedModel.id) && (
                <Lightbulb size={12} className="text-amber-500" />
              )}
            </div>
          ) : (
            'Select model'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-0" 
        align="start"
        sideOffset={4}
      >
        <Command className="max-h-[80vh]">
          <CommandInput placeholder="Search models..." />
          <CommandList className="max-h-[calc(80vh-40px)] overflow-y-auto">
            <CommandEmpty>No model found.</CommandEmpty>
            {Object.entries(groupedModels).map(([provider, models]) => (
              <CommandGroup key={provider}>
                {models.map(model => {
                  const modelId = createModelId(model)
                  return (
                    <CommandItem
                      key={modelId}
                      value={modelId}
                      onSelect={handleModelSelect}
                      className="flex justify-between mx-2 rounded-lg py-1"
                    >
                      <div className="flex items-center space-x-2">
                        {getModelIcon(model)}
                        <div className="flex flex-col gap-0">
                          <span className="text-xs font-medium leading-tight">
                            {model.name}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            {model.description}
                          </span>
                        </div>
                      </div>
                      <Check
                        className={`h-4 w-4 ${
                          selectedModelId === modelId
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
