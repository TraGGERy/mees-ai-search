import { CoreMessage, smoothStream, streamText } from 'ai'
import { retrieveTool } from '../tools/retrieve'
import { searchTool } from '../tools/search'
import { videoSearchTool } from '../tools/video-search'
import { PromptType, RESEARCHER_PROMPTS } from '../utils/prompts'
import { getModel } from '../utils/registry'

type ResearcherReturn = Parameters<typeof streamText>[0]

export function researcher({
  messages,
  model,
  searchMode,
  promptType = 'default',
  customSystemPrompt
}: {
  messages: CoreMessage[]
  model: string
  searchMode: boolean
  promptType?: PromptType
  customSystemPrompt?: string
}): ResearcherReturn {
  try {
    const currentDate = new Date().toLocaleString()
    
    let systemPrompt = customSystemPrompt
    if (!systemPrompt) {
      systemPrompt = RESEARCHER_PROMPTS[promptType] || RESEARCHER_PROMPTS['default']
      console.log('Selected prompt type:', promptType)
      console.log('Available prompts:', Object.keys(RESEARCHER_PROMPTS))
    }
    
    return {
      model: getModel(model),
      system: `${systemPrompt}\nCurrent date and time: ${currentDate}`,
      messages,
      tools: {
        search: searchTool,
        retrieve: retrieveTool,
        videoSearch: videoSearchTool
      },
      experimental_activeTools: searchMode
        ? ['search', 'retrieve', 'videoSearch']
        : [],
      maxSteps: searchMode ? 5 : 1,
      experimental_transform: smoothStream({ chunking: 'word' })
    }
  } catch (error) {
    console.error('Error in researcher:', error)
    throw error
  }
}
