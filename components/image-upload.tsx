'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ImageUploadProps {
  onUploadComplete: (document: any) => void
  icon?: React.ReactNode
}

export function ImageUpload({ onUploadComplete, icon }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append('imageFile', file)

    try {
      const response = await fetch('/api/upload-image', {
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
      console.error('Error during image upload:', error)
    } finally {
      setIsUploading(false)
      event.target.value = '' // Reset file input
    }
  }

  return (
    <div>
      <input
        type="file"
        id="image-upload-input"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <label htmlFor="image-upload-input">
        <Button asChild disabled={isUploading}>
          {icon ? (
            icon
          ) : (
            <span className={isUploading ? 'animate-pulse' : ''}>
              {isUploading ? 'Uploading Image...' : 'Upload Image for Search'}
            </span>
          )}
        </Button>
      </label>
    </div>
  )
} 