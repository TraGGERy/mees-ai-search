import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { PdfDocument } from '@/lib/types/models';

// Create a global array to store documents (for demo purposes)
if (!globalThis.pdfDocuments) {
  globalThis.pdfDocuments = [] as PdfDocument[];
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdfFile') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Verify file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use pdf-parse to extract text
    const data = await pdf(buffer);
    const extractedText = data.text;

    const pdfDocument: PdfDocument = {
      id: Date.now().toString(), // For demo; use a UUID in production
      userId: 'anonymous', // Replace with your auth user ID when available
      originalFilename: `uploaded-${Date.now()}.pdf`,
      extractedText,
      // You could add embeddings and chunkedText properties here if needed
      createdAt: new Date(),
    };

    // Save to our in-memory store
    globalThis.pdfDocuments.push(pdfDocument);

    return NextResponse.json({ document: pdfDocument }, { status: 200 });
  } catch (error) {
    console.error('Error processing PDF upload:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}

// Response type would match PdfDocument structure 