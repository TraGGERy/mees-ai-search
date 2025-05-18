import { researcher } from '@/lib/agents/researcher'
import {
  convertToCoreMessages,
  CoreMessage,
  createDataStreamResponse,
  DataStreamWriter,
  JSONValue,
  streamText
} from 'ai'
import { getMaxAllowedTokens, truncateMessages } from '../utils/context-window'
import { handleStreamFinish } from './handle-stream-finish'
import { BaseStreamConfig } from './types'
import { isReasoningModel } from '../utils/registry'
import { ExtendedCoreMessage } from '../types'

// Function to check if a message contains ask_question tool invocation
function containsAskQuestionTool(message: CoreMessage) {
  // For CoreMessage format, we check the content array
  if (message.role !== 'assistant' || !Array.isArray(message.content)) {
    return false
  }

  // Check if any content item is a tool-call with ask_question tool
  return message.content.some(
    item => item.type === 'tool-call' && item.toolName === 'ask_question'
  )
}

export function createToolCallingStreamResponse(config: BaseStreamConfig) {
  return createDataStreamResponse({
    execute: async (dataStream: DataStreamWriter) => {
      const { messages, model, chatId, searchMode, promptType } = config
      const modelId = model

      // Initialize progress tracking
      let progressDots = 0
      const maxDots = 3
      const progressInterval = setInterval(() => {
        progressDots = (progressDots + 1) % (maxDots + 1)
        const dots = '.'.repeat(progressDots)
        dataStream.writeData({
          type: 'status',
          status: `Generating${dots.padEnd(maxDots)}`
        })
      }, 500)

      try {
        // Send initial status and disable search toggle
        dataStream.writeData({
          type: 'search_toggle',
          enabled: false
        })
        dataStream.writeData({
          type: 'status',
          status: 'Starting research...'
        })

        const coreMessages = convertToCoreMessages(messages)
        const truncatedMessages = truncateMessages(
          coreMessages,
          getMaxAllowedTokens(model)
        )

        // Add timeout handling
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            clearInterval(progressInterval)
            dataStream.writeData({
              type: 'search_toggle',
              enabled: true
            })
            reject(new Error('Response timeout after 30 seconds'))
          }, 30000)
        })

        // Update status for research phase
        dataStream.writeData({
          type: 'status',
          status: 'Analyzing query...'
        })

        let researcherConfig = await researcher({
          messages: truncatedMessages,
          model: modelId,
          searchMode,
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
            clearInterval(progressInterval)
            try {
              dataStream.writeData({
                type: 'status',
                status: 'Processing results...'
              })

              const responseMessages = result.response.messages.map(msg => ({
                ...msg,
                content: msg.content || result.reasoning,
                id: msg.id || crypto.randomUUID()
              })) as CoreMessage[]
              
              const shouldSkipRelatedQuestions =
                isReasoningModel(modelId) ||
                (responseMessages.length > 0 &&
                  containsAskQuestionTool(
                    responseMessages[responseMessages.length - 1]
                  ))

              const annotations: ExtendedCoreMessage[] = []
              if (result.reasoning) {
                annotations.push({
                  role: 'data',
                  content: {
                    type: 'reasoning',
                    data: result.reasoning
                  } as JSONValue
                })
              }
              
              await handleStreamFinish({
                responseMessages,
                originalMessages: messages,
                model: modelId,
                chatId,
                dataStream,
                skipRelatedQuestions: shouldSkipRelatedQuestions,
                annotations
              })

              // Re-enable search toggle after completion
              dataStream.writeData({
                type: 'search_toggle',
                enabled: true
              })
              dataStream.writeData({
                type: 'status',
                status: 'Complete'
              })
            } catch (error) {
              clearInterval(progressInterval)
              // Re-enable search toggle on error
              dataStream.writeData({
                type: 'search_toggle',
                enabled: true
              })
              console.error('Error in stream finish handling:', error)
              dataStream.writeData({
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown streaming error'
              })
            }
          }
        })

        await Promise.race([
          result.mergeIntoDataStream(dataStream, {
            sendReasoning: true
          }),
          timeoutPromise
        ])
      } catch (error) {
        clearInterval(progressInterval)
        // Re-enable search toggle on error
        dataStream.writeData({
          type: 'search_toggle',
          enabled: true
        })
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
