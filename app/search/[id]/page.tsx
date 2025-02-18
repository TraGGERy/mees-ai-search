import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
import { Metadata, NextPage } from 'next'
import { redirect } from 'next/navigation'

export const maxDuration = 60

export const dynamic = 'force-dynamic'

interface SearchPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { id } = params
  const chat = await getChat(id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search'
  }
}

const Page: NextPage<{
  params: { id: string }
}> = async ({ params }) => {
  const { id } = params
  const chat = await getChat(id)

  if (!chat) {
    console.log(`Chat not found, redirecting from ID: ${id}`)
    redirect('/')
  }

  // Convert messages for the chat component
  const messages = convertToUIMessages(chat.messages || [])

  return <Chat id={id} savedMessages={messages} />
}

export default Page
