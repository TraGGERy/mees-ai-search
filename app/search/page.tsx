import { SearchChat } from '@/components/search-chat'
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
  return {
    title: 'Search',
  }
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q;
  
  if (!q) {
    redirect('/')
  }

  const id = generateId()
  return <SearchChat id={id} query={q} promptType="default" />
}
