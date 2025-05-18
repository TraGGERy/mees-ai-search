import {
  CoreMessage,
  DataStreamWriter,
  generateId,
  generateText,
  JSONValue
} from 'ai'
import { z } from 'zod'
import { searchSchema } from '../schema/search'
import { search } from '../tools/search'
import { ExtendedCoreMessage } from '../types'
import { getToolCallModel } from '../utils/registry'
import { parseToolCallXml } from './parse-tool-call'

interface ToolExecutionResult {
  toolCallDataAnnotation: ExtendedCoreMessage | null
  toolCallMessages: CoreMessage[]
}

export async function executeToolCall(
  coreMessages: CoreMessage[],
  dataStream: DataStreamWriter,
  model: string,
  searchMode: boolean
): Promise<ToolExecutionResult> {
  // If search mode is disabled, return empty tool call
  if (!searchMode) {
    return { toolCallDataAnnotation: null, toolCallMessages: [] }
  }

  const toolCallModel = getToolCallModel(model)
  // Convert Zod schema to string representation
  const searchSchemaString = Object.entries(searchSchema.shape)
    .map(([key, value]) => {
      const description = value.description
      const isOptional = value instanceof z.ZodOptional
      return `- ${key}${isOptional ? ' (optional)' : ''}: ${description}`
    })
    .join('\n')
  const defaultMaxResults = model?.includes('ollama') ? 5 : 20

  // Generate tool selection using XML format
  const toolSelectionResponse = await generateText({
    model: toolCallModel,
    system: `You are an intelligent assistant that analyzes conversations to select the most appropriate tools and their parameters.
            You excel at understanding context to determine when and how to use available tools, including crafting effective search queries.
            Current date: ${new Date().toISOString().split('T')[0]}

            Do not include any other text in your response.
            Respond in XML format with the following structure:
            <tool_call>
              <tool>tool_name</tool>
              <parameters>
                <query>search query text</query>
                <max_results>number - ${defaultMaxResults} by default</max_results>
                <search_depth>basic or advanced</search_depth>
                <include_domains>domain1,domain2</include_domains>
                <exclude_domains>domain1,domain2</exclude_domains>
              </parameters>
            </tool_call>

            Available tools: search

            Search parameters:
            ${searchSchemaString}

            If you don't need a tool, respond with <tool_call><tool></tool></tool_call>`,
    messages: coreMessages
  })

  // Parse the tool selection XML using the search schema
  const toolCall = parseToolCallXml(toolSelectionResponse.text, searchSchema)

  if (!toolCall || toolCall.tool === '') {
    return { toolCallDataAnnotation: null, toolCallMessages: [] }
  }

  const toolCallId = `call_${generateId()}`
  const toolCallAnnotation = {
    type: 'tool_call',
    data: {
      state: 'call',
      toolCallId,
      toolName: toolCall.tool,
      args: JSON.stringify(toolCall.parameters)
    }
  }
  
  // Write the initial tool call annotation immediately
  dataStream.writeData(toolCallAnnotation)

  try {
    // Support for search tool only for now
    const searchResults = await search(
      toolCall.parameters?.query ?? '',
      toolCall.parameters?.max_results,
      toolCall.parameters?.search_depth as 'basic' | 'advanced',
      toolCall.parameters?.include_domains ?? [],
      toolCall.parameters?.exclude_domains ?? []
    )

    // Stream results in smaller chunks for faster initial display
    if (searchResults?.results?.length > 0) {
      // First show a minimal result set (2 items) very quickly for immediate feedback
      const initialResults = {
        ...searchResults,
        results: searchResults.results.slice(0, 2),
        images: searchResults.images?.slice(0, 2) || []
      }
      
      const initialAnnotation = {
        ...toolCallAnnotation,
        data: {
          ...toolCallAnnotation.data,
          result: JSON.stringify(initialResults),
          state: 'partial'
        }
      }
      dataStream.writeMessageAnnotation(initialAnnotation)
      
      // Small delay to let UI process
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Then stream results in multiple small batches for better responsiveness
    const chunkSize = 3;
    const delayBetweenChunks = 60; // ms
    
    // Stream results in small chunks
    for (let i = 0; i < searchResults.results.length; i += chunkSize) {
      const chunk = searchResults.results.slice(i, i + chunkSize)
      const chunkResults = {
        ...searchResults,
        results: chunk,
        // Include a subset of images with each chunk to improve UX
        images: searchResults.images?.slice(0, Math.min(i + 2, searchResults.images?.length || 0)) || []
      }
      
      const chunkAnnotation = {
        ...toolCallAnnotation,
        data: {
          ...toolCallAnnotation.data,
          result: JSON.stringify(chunkResults),
          state: i + chunkSize >= searchResults.results.length ? 'result' : 'partial'
        }
      }
      dataStream.writeMessageAnnotation(chunkAnnotation)
      
      // Add a small delay between chunks to let the UI breathe
      if (i + chunkSize < searchResults.results.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
      }
    }

    const toolCallDataAnnotation: ExtendedCoreMessage = {
      role: 'data',
      content: {
        type: 'tool_call',
        data: {
          ...toolCallAnnotation.data,
          result: JSON.stringify(searchResults),
          state: 'result'
        }
      } as JSONValue
    }

    const toolCallMessages: CoreMessage[] = [
      {
        role: 'assistant',
        content: `Tool call result: ${JSON.stringify(searchResults)}`
      },
      {
        role: 'user',
        content: 'Now answer the user question.'
      }
    ]

    return { toolCallDataAnnotation, toolCallMessages }
  } catch (error) {
    console.error('Search execution error:', error)
    // Write error state to stream
    const errorAnnotation = {
      ...toolCallAnnotation,
      data: {
        ...toolCallAnnotation.data,
        state: 'error',
        error: 'Failed to execute search'
      }
    }
    dataStream.writeMessageAnnotation(errorAnnotation)
    return { toolCallDataAnnotation: null, toolCallMessages: [] }
  }
}