import { relatedSchema } from '@/lib/schema/related'
import { CoreMessage, generateObject } from 'ai'
import { getModel, isReasoningModel } from '../utils/registry'

export async function generateRelatedQuestions(
  messages: CoreMessage[],
  model: string
) {
  // Extract the user's query from the messages
  let userQuery = "life"
  
  // Find the last user message to extract the query
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      userQuery = messages[i].content as string
      break
    }
  }

  // Use gpt-4o-mini for reasoning models, otherwise use the selected model
  const relatedQuestionsModel = isReasoningModel(model) 
    ? getModel('openai:gpt-4o-mini')
    : getModel(model)

  try {
    // Create a new message array with just the user query
    const cleanMessages: CoreMessage[] = [
      {
        role: 'user',
        content: userQuery
      } as CoreMessage
    ]

    const result = await generateObject({
      model: relatedQuestionsModel,
      system: `As a professional web researcher, your task is to generate a set of three queries that explore the subject matter more deeply, building upon the initial query and the information uncovered in its search results.

      For instance, if the original query was "Starship's third test flight key milestones", your output should follow this format:

      Aim to create queries that progressively delve into more specific aspects, implications, or adjacent topics related to the initial query. The goal is to anticipate the user's potential information needs and guide them towards a more comprehensive understanding of the subject matter.
      Please match the language of the response to the user's language.`,
      messages: cleanMessages,
      schema: relatedSchema
    })

    return result
  } catch (error) {
    console.error('Error generating related questions:', error)
    // Return a default result in case of error
    return {
      object: {
        items: [
          { query: "What is the meaning of life?" },
          { query: "How do different cultures view the purpose of life?" },
          { query: "What are some philosophical perspectives on life?" }
        ]
      }
    }
  }
}
