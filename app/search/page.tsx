import { SearchChat } from '@/components/search-chat'
import { getChat } from '@/lib/actions/chat'
import { generateId } from 'ai'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

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
  searchParams: Promise<{ q?: string }> | { q?: string }
}) {
  // Handle both Promise and non-Promise cases
  const params = searchParams instanceof Promise ? await searchParams : searchParams
  const q = params.q
  
  if (!q) {
    redirect('/')
  }

  const id = generateId()
  return <SearchChat id={id} query={q} promptType="default" />
}
