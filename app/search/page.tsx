import { SearchChat } from '@/components/search-chat'
import { generateId } from 'ai'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const maxDuration = 60

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Search',
  }
}

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q;
  
  if (!q) {
    redirect('/')
  }

  const id = generateId()
  return <SearchChat id={id} query={q} promptType="default" />
}
