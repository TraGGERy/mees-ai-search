import { CoreMessage, smoothStream, streamText } from 'ai'
import { retrieveTool } from '../tools/retrieve'
import { searchTool } from '../tools/search'
import { videoSearchTool } from '../tools/video-search'
import { PromptType, RESEARCHER_PROMPTS } from '../utils/prompts'
import { getModel } from '../utils/registry'
import { askQuestionTool } from '../tools/question'

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

    // Add specific configuration for Deep model
    const isDeepModel = model.includes('gemini-2.0-flash')
    const modelConfig = isDeepModel ? {
      temperature: 0.7,
      topP: 1,
      topK: 40,
      maxOutputTokens: 2048,
      stream: true,
      streamChunkSize: 5, // Reduced chunk size for more frequent updates
      experimental_transform: smoothStream({ 
        chunking: 'word',
        delayInMs: 25 // Reduced delay for faster streaming
      })
    } : {
      experimental_transform: smoothStream({
        chunking: 'word',
        delayInMs: 25 // Added optimized streaming for non-deep models
      })
    }

    return {
      model: getModel(model),
      system: `${systemPrompt}\nCurrent date and time: ${currentDate}`,
      messages,
      tools: {
        search: searchTool,
        retrieve: retrieveTool,
        videoSearch: videoSearchTool,
        askQuestion: askQuestionTool
      },
      experimental_activeTools: searchMode
        ? ['search', 'retrieve', 'videoSearch', 'askQuestion']
        : [],
      maxSteps: searchMode ? 5 : 1,
      ...modelConfig
    }
  } catch (error) {
    console.error('Error in researcher:', error)
    throw error
  }
}
