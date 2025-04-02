import { researcher } from '@/lib/agents/researcher'
import {
  convertToCoreMessages,
  createDataStreamResponse,
  DataStreamWriter,
  streamText
} from 'ai'
import { getMaxAllowedTokens, truncateMessages } from '../utils/context-window'
import { handleStreamFinish } from './handle-stream-finish'
import { BaseStreamConfig } from './types'
import { isReasoningModel } from '../utils/registry'

export function createToolCallingStreamResponse(config: BaseStreamConfig) {
  return createDataStreamResponse({
    execute: async (dataStream: DataStreamWriter) => {
      const { messages, model, chatId, searchMode } = config

      try {
        const coreMessages = convertToCoreMessages(messages)
        const truncatedMessages = truncateMessages(
          coreMessages,
          getMaxAllowedTokens(model)
        )

        let researcherConfig = await researcher({
          messages: truncatedMessages,
          model,
          searchMode
        })

        const result = streamText({
          ...researcherConfig,
          onFinish: async result => {
            // For reasoning models, ensure both reasoning and response content are included
            const responseMessages = result.response.messages.map(msg => ({
              ...msg,
              content: msg.content || result.reasoning // Use reasoning as content if no content is present
            }))

            await handleStreamFinish({
              responseMessages,
              originalMessages: messages,
              model,
              chatId,
              dataStream,
              skipRelatedQuestions: isReasoningModel(model)
            })
          }
        })

        result.mergeIntoDataStream(dataStream)
      } catch (error) {
        console.error('Stream execution error:', error)
        throw error
      }
    },
    onError: error => {
      console.error('Stream error:', error)
      return error instanceof Error ? error.message : String(error)
    }
  })
}
