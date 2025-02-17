import { NextResponse } from 'next/server'
import { ImageDocument } from '@/lib/types/models'
import { extractImageEmbedding } from '@/lib/image-utils'

// Create a global array to store image documents (for demo purposes)
if (!globalThis.imageDocuments) {
  globalThis.imageDocuments = [] as ImageDocument[]
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('imageFile') as Blob | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Verify that the file is a valid image type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    // Extract an image embedding (dummy implementation for now)
    const embedding = await extractImageEmbedding(buffer)

    const imageDocument: ImageDocument = {
      id: Date.now().toString(), // Replace with a proper unique identifier
      userId: 'anonymous', // Replace with actual authenticated user ID when available
      filePath: `/public/images/dummy-${Date.now()}.jpg`, // In production, store and return the correct path
      embeddings: embedding,
      metadata: {
        width: 800, // Dummy value; ideally, extract the actual width
        height: 600, // Dummy value; ideally, extract the actual height
        format: file.type,
        ocrText: '' // Optionally after processing OCR
      },
      uploadedAt: new Date()
    }

    // Save to our in-memory store
    globalThis.imageDocuments.push(imageDocument)

    return NextResponse.json({ document: imageDocument }, { status: 200 })
  } catch (error) {
    console.error('Error processing image upload:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
} 