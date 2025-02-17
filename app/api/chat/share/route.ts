import { getSharedChat } from '@/lib/actions/chat'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Chat ID is required' }),
        { status: 400 }
      )
    }

    const chat = await getSharedChat(id)

    if (!chat) {
      return new NextResponse(
        JSON.stringify({ error: 'Shared chat not found' }),
        { status: 404 }
      )
    }

    return new NextResponse(JSON.stringify(chat))
  } catch (error) {
    console.error('Error in share API:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to get shared chat' 
      }),
      { status: 500 }
    )
  }
} 