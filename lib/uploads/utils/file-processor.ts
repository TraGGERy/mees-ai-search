import pdfParse from 'pdf-parse';
import { FileContent } from '@/lib/types/api';

export async function processFile(file: Buffer, mimeType: string): Promise<FileContent> {
  if (mimeType === 'application/pdf') {
    const pdfData = await pdfParse(file);
    return {
      type: 'pdf',
      content: Buffer.from(pdfData.text),
      mimeType: 'text/plain',
    };
  } else if (mimeType.startsWith('image/')) {
    return {
      type: 'image',
      content: file,
      mimeType,
    };
  }
  
  throw new Error('Unsupported file type');
}