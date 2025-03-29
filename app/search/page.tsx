import { getChat } from '@/lib/actions/chat'
import { generateId } from 'ai'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SearchChat } from '@/components/search-chat'

export const maxDuration = 60

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const chat = await getChat(params.id)
  return {
    title: chat?.title?.toString().slice(0, 50) || 'Search',
  }
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string }
}) {
  const q = searchParams.q
  if (!q) {
    redirect('/')
  }

  const id = generateId()
  return <SearchChat id={id} query={q} promptType="default" />
}
