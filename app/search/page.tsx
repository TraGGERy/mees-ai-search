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

// Use the specific interface from Next.js
interface SearchPageProps {
  params: {};  // Empty object since this page doesn't have dynamic params
  searchParams: { q?: string };
}

// Make the function async to match Next.js 15 patterns
export default async function Page(props: SearchPageProps) {
  const { searchParams } = props;
  const q = searchParams?.q;
  
  if (!q) {
    redirect('/');
  }

  const id = generateId();
  return <SearchChat id={id} query={q} promptType="default" />;
}
