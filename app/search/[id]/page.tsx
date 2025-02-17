import { Chat } from '@/components/chat'
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
import { redirect } from 'next/navigation'

export const maxDuration = 60

export async function generateMetadata(props: {
  params: { id: string },
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { id } = props.params
  const chat = await getChat(id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search'
  }
}

interface PageProps {
  params: { id: string },
  searchParams?: { [key: string]: string | string[] | undefined }
}

const Page = async ({ params }: PageProps) => {
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
