import { NextResponse } from 'next/server';
import { PdfSearchResult } from '@/lib/types/models';

// Ensure global pdfDocuments array exists
if (!globalThis.pdfDocuments) {
  globalThis.pdfDocuments = [];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    // If no query provided, return an empty result
    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Search over stored pdfDocuments
    const results: PdfSearchResult[] = globalThis.pdfDocuments
      .filter((doc) => doc.extractedText.toLowerCase().includes(query))
      .map((doc) => ({
        documentId: doc.id,
        // For simplicity return the first 100 characters from the matched text as snippet
        snippet: doc.extractedText.substring(0, 100) + '...',
        pageNumber: undefined, // Optionally, you could extract page info
        similarityScore: 1,    // Dummy constant score for now
      }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error during PDF search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 