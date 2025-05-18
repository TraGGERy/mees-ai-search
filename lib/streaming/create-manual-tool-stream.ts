import {
  convertToCoreMessages,
  CoreMessage,
  createDataStreamResponse,
  DataStreamWriter,
  JSONValue,
  streamText
} from 'ai'
import { manualResearcher } from '../agents/manual-researcher'
import { ExtendedCoreMessage } from '../types'
import { getMaxAllowedTokens, truncateMessages } from '../utils/context-window'
import { handleStreamFinish } from './handle-stream-finish'
import { executeToolCall } from './tool-execution'
import { BaseStreamConfig } from './types'
import { isReasoningModel } from '../utils/registry'

export function createManualToolStreamResponse(config: BaseStreamConfig) {
  return createDataStreamResponse({
    execute: async (dataStream: DataStreamWriter) => {
      const { messages, model, chatId, searchMode, promptType } = config
      try {
        const coreMessages = convertToCoreMessages(messages)
        const truncatedMessages = truncateMessages(
          coreMessages,
          getMaxAllowedTokens(model)
        )

        const { toolCallDataAnnotation, toolCallMessages } =
          await executeToolCall(
            truncatedMessages,
            dataStream,
            model,
            searchMode
          )

        const researcherConfig = manualResearcher({
          messages: [...truncatedMessages, ...toolCallMessages],
          model,
          isSearchEnabled: searchMode,
          promptType
        })

        let tokenCount = 0
        const result = streamText({
          ...researcherConfig,
          onChunk: ({ chunk }) => {
            if (chunk.type === 'text-delta') {
              tokenCount++
              // Only update status occasionally to avoid flooding
              if (tokenCount % 5 === 0) {
                dataStream.writeData({
                  type: 'status',
                  status: `Generated ${tokenCount} tokens...`
                })
              }
            }
          },
          onFinish: async result => {
            try {
              // For reasoning models, ensure both reasoning and response content are included
              const responseMessages = result.response.messages.map(msg => ({
                ...msg,
                content: msg.content || result.reasoning, // Use reasoning as content if no content is present
                id: msg.id || crypto.randomUUID() // Ensure each message has an ID
              }))

              const annotations: ExtendedCoreMessage[] = [
                ...(toolCallDataAnnotation ? [toolCallDataAnnotation] : []),
                {
                  role: 'data',
                  content: {
                    type: 'reasoning',
                    data: result.reasoning
                  } as JSONValue
                }
              ]
              
              await handleStreamFinish({
                responseMessages: responseMessages as CoreMessage[],
                originalMessages: messages,
                model,
                chatId,
                dataStream,
                skipRelatedQuestions: isReasoningModel(model),
                annotations
              })
            } catch (error) {
              console.error('Error in stream finish handling:', error)
              dataStream.writeData({
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown streaming error'
              })
            }
          }
        })

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true
        })
      } catch (error) {
        console.error('Stream execution error:', error)
        dataStream.writeData({
          type: 'error',
          error: error instanceof Error ? error.message : 'Stream execution error'
        })
      }
    },
    onError: error => {
      console.error('Stream error:', error)
      return error instanceof Error ? error.message : String(error)
    }
  })
}
