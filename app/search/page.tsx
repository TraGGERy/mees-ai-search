import { SearchChat } from '@/components/search-chat'
import { generateId } from 'ai'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const maxDuration = 60

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { id: string };
  searchParams?: { q?: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Search',
  }
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const q = searchParams?.q;
  
  if (!q) {
    redirect('/')
  }

  const id = generateId()
  return <SearchChat id={id} query={q} promptType="default" />
}
