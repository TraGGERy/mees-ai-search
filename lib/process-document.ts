import { put } from '@vercel/kv';
import { createParser } from 'pdf-parse';

export async function processDocument(file: Buffer, filename: string) {
  try {
    let text = '';
    
    if (filename.endsWith('.pdf')) {
      const data = await createParser(file);
      text = data.text;
    } else {
      // For images, you would implement OCR here
      // This is a placeholder for image processing
      text = 'Image content would be processed here';
    }

    // Store the processed text in KV store
    const documentId = `doc:${Date.now()}`;
    await put(documentId, text);

    return {
      documentId,
      text,
    };
  } catch (error) {
    console.error('Document processing error:', error);
    throw new Error('Failed to process document');
  }
}