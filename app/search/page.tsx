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

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  try {
    const { q } = await props.searchParams
    
    if (!q?.trim()) {
      redirect('/')
    }

    if (q.length > 200) {
      redirect('/error?code=query_too_long')
    }

    const id = generateId()
    return <SearchChat id={id} query={q} promptType="default" />

  } catch (error) {
    console.error('Search params error:', error)
    redirect('/error?code=invalid_search')
  }
}
