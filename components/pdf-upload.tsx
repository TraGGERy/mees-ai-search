'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface PdfUploadProps {
  onUploadComplete: (document: any) => void
  icon?: React.ReactNode
}

export function PdfUpload({ onUploadComplete, icon }: PdfUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append('pdfFile', file)

    try {
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Upload failed:', errorData.error || 'Unknown error')
      } else {
        const result = await response.json()
        onUploadComplete(result.document)
      }
    } catch (error) {
      console.error('Error during PDF upload:', error)
    } finally {
      setIsUploading(false)
      event.target.value = '' // Reset file input
    }
  }

  return (
    <div>
      <input
        type="file"
        id="pdf-upload-input"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <label htmlFor="pdf-upload-input">
        <Button asChild disabled={isUploading}>
          {icon ? (
            icon
          ) : (
            <span className={isUploading ? 'animate-pulse' : ''}>
              {isUploading ? 'Uploading PDF...' : 'Upload PDF for Search'}
            </span>
          )}
        </Button>
      </label>
    </div>
  )
} 