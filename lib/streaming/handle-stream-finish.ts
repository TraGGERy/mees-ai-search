import { saveChat } from '@/lib/actions/chat'
import { generateRelatedQuestions } from '@/lib/agents/generate-related-questions'
import { Chat, ExtendedCoreMessage } from '@/lib/types'
import { auth } from '@clerk/nextjs/server'
import { CoreMessage, DataStreamWriter, JSONValue, Message, convertToCoreMessages } from 'ai'
import { getRedisClient } from '../redis/config'

// Implement the function directly to avoid import issues
function convertToExtendedCoreMessages(
  messages: Message[]
): ExtendedCoreMessage[] {
  const result: ExtendedCoreMessage[] = []

  for (const message of messages) {
    // Convert annotations to data messages
    if (message.annotations && message.annotations.length > 0) {
      message.annotations.forEach(annotation => {
        result.push({
          role: 'data',
          content: annotation
        })
      })
    }

    // Convert reasoning to data message
    if (message.reasoning) {
      result.push({
        role: 'data',
        content: {
          type: 'reasoning',
          data: message.reasoning
        } as JSONValue
      })
    }

    // Convert current message
    const converted = convertToCoreMessages([message])
    result.push(...converted)
  }

  return result
}

interface HandleStreamFinishParams {
  responseMessages: CoreMessage[]
  originalMessages: Message[]
  model: string
  chatId: string
  dataStream: DataStreamWriter
  skipRelatedQuestions?: boolean
  annotations?: ExtendedCoreMessage[]
}

export async function handleStreamFinish({
  responseMessages,
  originalMessages,
  model,
  chatId,
  dataStream,
  skipRelatedQuestions = false,
  annotations = []
}: HandleStreamFinishParams) {
  try {
    const { userId } = await auth()
    const redis = await getRedisClient()

    // Check if model is restricted (except gpt-4o-mini)
    const isRestrictedModel = !model.includes('gpt-4o-mini')
    if (!userId && isRestrictedModel) {
      throw new Error('Please login to access advanced models')
    }

    const extendedCoreMessages = convertToExtendedCoreMessages(originalMessages)
    let allAnnotations = [...annotations]

    // Generate related questions for all users to maintain functionality
    if (!skipRelatedQuestions) {
      const relatedQuestionsAnnotation: JSONValue = {
        type: 'related-questions',
        data: { items: [] }
      }
      dataStream.writeMessageAnnotation(relatedQuestionsAnnotation)

      // Generate related questions in parallel with other operations
      const relatedQuestionsPromise = generateRelatedQuestions(
        responseMessages,
        model
      )

      const updatedRelatedQuestionsAnnotation: ExtendedCoreMessage = {
        role: 'data',
        content: {
          type: 'related-questions',
          data: (await relatedQuestionsPromise).object
        } as JSONValue
      }

      dataStream.writeMessageAnnotation(
        updatedRelatedQuestionsAnnotation.content as JSONValue
      )
      allAnnotations.push(updatedRelatedQuestionsAnnotation)
    }

    // Create the message to save
    const generatedMessages = [
      ...extendedCoreMessages,
      ...responseMessages.slice(0, -1),
      ...allAnnotations,
      ...responseMessages.slice(-1).map(msg => ({
        role: msg.role,
        content: msg.content,
        id: crypto.randomUUID()
      }))
    ] as ExtendedCoreMessage[]

    // Write the final response message to the stream
    const finalMessage = responseMessages[responseMessages.length - 1]
    if (finalMessage) {
      try {
        const formattedMessage = {
          role: finalMessage.role,
          content: finalMessage.content,
          id: crypto.randomUUID()
        }
        dataStream.writeData({
          type: 'message',
          message: formattedMessage
        } as JSONValue)
      } catch (error) {
        console.error('Error writing final message to stream:', error)
      }
    }

    // Save chat in parallel with other operations
    const chatToSave: Chat = {
      id: chatId,
      title: originalMessages[0].content,
      messages: generatedMessages,
      createdAt: new Date(),
      userId: userId || 'anonymous',
      path: `/search/${chatId}`
    }

    // Don't await the save operation to avoid blocking
    saveChat(chatToSave).catch(error => {
      console.error('Failed to save chat:', error)
    })
  } catch (error) {
    console.error('Error in handleStreamFinish:', error)
    throw error
  }
}
