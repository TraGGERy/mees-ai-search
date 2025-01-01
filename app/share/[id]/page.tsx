import { notFound } from 'next/navigation'
import { Chat } from '@/components/chat'
import { getSharedChat, getChat, getChatNeon } from '@/lib/actions/chat'
import { AI } from '@/app/actions'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export default async function SharePage({
  params
}: {
  params: { id: string }
}) {
  try {
    // First try to get as a shared chat
    let chat = await getSharedChat(params.id)

    // If not found as shared, try normal chat retrieval
    if (!chat) {
      chat = await getChat(params.id, 'anonymous')
    }

    // Finally try Neon if still not found
    if (!chat) {
      chat = await getChatNeon(params.id)
    }

    // Show 404 only if chat doesn't exist anywhere
    if (!chat) {
      console.log('Chat not found:', params.id)
      return notFound()
    }

    // Mark as shared for the UI
    chat.shared = true

    return (
      <div className="flex-1 overflow-hidden">
        <AI initialAIState={{
          chatId: chat.id,
          messages: chat.messages
        }}>
          <Chat id={params.id} />
        </AI>
      </div>
    )
  } catch (error) {
    console.error('Share page error:', error)
    return notFound()
  }
}
