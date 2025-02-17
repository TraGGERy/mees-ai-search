import { saveChat } from '@/lib/actions/chat'
import { generateRelatedQuestions } from '@/lib/agents/generate-related-questions'
import { Chat, ExtendedCoreMessage } from '@/lib/types'
import { convertToExtendedCoreMessages } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import { CoreMessage, DataStreamWriter, JSONValue, Message } from 'ai'
import { getRedisClient } from '../redis/config'

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

      const relatedQuestions = await generateRelatedQuestions(
        responseMessages,
        model
      )

      const updatedRelatedQuestionsAnnotation: ExtendedCoreMessage = {
        role: 'data',
        content: {
          type: 'related-questions',
          data: relatedQuestions.object
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
      ...responseMessages.slice(-1)
    ] as ExtendedCoreMessage[]

    // Create a properly typed chat object
    const chatToSave: Chat = {
      id: chatId,
      title: originalMessages[0].content,
      messages: generatedMessages,
      createdAt: new Date(),
      userId: userId || 'anonymous',
      path: `/search/${chatId}`
    }

    await saveChat(chatToSave).catch(error => {
      console.error('Failed to save chat:', error)
      throw new Error('Failed to save chat history')
    })
  } catch (error) {
    console.error('Error in handleStreamFinish:', error)
    throw error
  }
}
