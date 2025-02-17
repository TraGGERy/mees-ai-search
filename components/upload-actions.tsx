'use client'

import { PdfUpload } from './pdf-upload'
import { ImageUpload } from './image-upload'
import { FileText, Image as ImageIcon } from 'lucide-react'

interface UploadActionsProps {
  onPdfUploadComplete: (document: any) => void
  onImageUploadComplete: (document: any) => void
}

export function UploadActions({ onPdfUploadComplete, onImageUploadComplete }: UploadActionsProps) {
  return (
    <div className="flex space-x-2">
      <PdfUpload onUploadComplete={onPdfUploadComplete} icon={<FileText size={20} />} />
      <ImageUpload onUploadComplete={onImageUploadComplete} icon={<ImageIcon size={20} />} />
    </div>
  )
} 