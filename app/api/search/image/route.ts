import { NextResponse } from 'next/server';
import { ImageSearchResult } from '@/lib/types/models';

// Ensure global imageDocuments array exists
if (!globalThis.imageDocuments) {
  globalThis.imageDocuments = [];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    // For demonstration we ignore query processing and return all images with a dummy similarity score;
    // In a production model, you'd embed the query and calculate cosine similarity with image embeddings.
    const results: ImageSearchResult[] = globalThis.imageDocuments.map((doc) => ({
      imageId: doc.id,
      // Construct a thumbnail URL from the stored filePath (adjust as needed)
      thumbnailUrl: doc.filePath,
      similarityScore: Math.random(),  // Dummy random score
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error during image search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 