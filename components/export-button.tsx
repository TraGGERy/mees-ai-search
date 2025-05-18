'use client'

import { Button } from './ui/button'
import { Download } from 'lucide-react'
import { Message } from 'ai'
import { useState } from 'react'
import { toast } from 'sonner'
import { SearchResultImage } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface ExportButtonProps {
  messages: Message[]
  isLoading: boolean
}

export function ExportButton({ messages, isLoading }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExportHTML = async () => {
    try {
      setExporting(true)
      
      // Create a container to hold all content
      const container = document.createElement('div')
      container.className = 'export-container'
      container.style.fontFamily = 'Arial, sans-serif'
      container.style.padding = '20px'
      container.style.maxWidth = '800px'
      container.style.margin = '0 auto'
      
      // Add title
      const title = document.createElement('h1')
      title.textContent = 'Mees AI Search Results'
      title.style.borderBottom = '1px solid #ddd'
      title.style.paddingBottom = '10px'
      title.style.marginBottom = '20px'
      container.appendChild(title)

      // Process each message
      let imageUrls: string[] = []
      
      messages.forEach((message, index) => {
        const messageEl = document.createElement('div')
        messageEl.style.marginBottom = '20px'
        
        // Create message header
        const header = document.createElement('div')
        header.style.fontWeight = 'bold'
        header.style.marginBottom = '8px'
        header.textContent = message.role === 'user' ? 'You:' : 'AI:'
        messageEl.appendChild(header)
        
        // Create message content
        const content = document.createElement('div')
        content.style.marginLeft = '20px'
        content.style.marginBottom = '10px'
        content.textContent = message.content
        messageEl.appendChild(content)
        
        // Extract images from message parts (newer format)
        if (message.parts) {
          message.parts.forEach(part => {
            if (part.type === 'tool-invocation' && 
                part.toolInvocation.toolName === 'search' && 
                part.toolInvocation.result?.images) {
              
              const images = part.toolInvocation.result.images as SearchResultImage[]
              addImagesToMessage(messageEl, images, imageUrls)
            }
          })
        }
        
        // Extract images from annotations (older format)
        const toolAnnotations = message.annotations?.filter(
          annotation => (annotation as any)?.type === 'tool_call'
        ) as any[] || []
        
        toolAnnotations.forEach(annotation => {
          if (annotation?.data?.toolName === 'search' && annotation?.data?.result?.images) {
            const images = annotation.data.result.images as SearchResultImage[]
            addImagesToMessage(messageEl, images, imageUrls)
          }
        })
        
        container.appendChild(messageEl)
      })
      
      // Convert to HTML string
      const htmlContent = container.outerHTML
      
      // Create a Blob with the HTML content
      const blob = new Blob([`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mees AI Search Results</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `], { type: 'text/html' })
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'mees-ai-search-results.html'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Search results exported as HTML')
    } catch (error) {
      console.error('Error exporting search results:', error)
      toast.error('Failed to export search results')
    } finally {
      setExporting(false)
    }
  }
  
  const handleExportPDF = async () => {
    try {
      setExporting(true)
      
      // Load html2pdf dynamically
      const html2pdfModule = await import('html2pdf.js')
      const html2pdf = html2pdfModule.default
      
      // Create a container for the PDF content
      const container = document.createElement('div')
      container.className = 'export-container'
      container.style.fontFamily = 'Arial, sans-serif'
      container.style.padding = '20px'
      container.style.maxWidth = '800px'
      container.style.margin = '0 auto'
      
      // Add title
      const title = document.createElement('h1')
      title.textContent = 'Mees AI Search Results'
      title.style.borderBottom = '1px solid #ddd'
      title.style.paddingBottom = '10px'
      title.style.marginBottom = '20px'
      container.appendChild(title)

      // Process each message
      let imageUrls: string[] = []
      
      for (const message of messages) {
        const messageEl = document.createElement('div')
        messageEl.style.marginBottom = '20px'
        
        // Create message header
        const header = document.createElement('div')
        header.style.fontWeight = 'bold'
        header.style.marginBottom = '8px'
        header.textContent = message.role === 'user' ? 'You:' : 'AI:'
        messageEl.appendChild(header)
        
        // Create message content
        const content = document.createElement('div')
        content.style.marginLeft = '20px'
        content.style.marginBottom = '10px'
        content.textContent = message.content
        messageEl.appendChild(content)
        
        // Extract images from message parts and annotations
        // Images for PDF need special handling to ensure they're fully loaded
        const imagesToProcess: SearchResultImage[] = []
        
        // Extract from parts
        if (message.parts) {
          message.parts.forEach(part => {
            if (part.type === 'tool-invocation' && 
                part.toolInvocation.toolName === 'search' && 
                part.toolInvocation.result?.images) {
              
              imagesToProcess.push(...(part.toolInvocation.result.images as SearchResultImage[]))
            }
          })
        }
        
        // Extract from annotations
        const toolAnnotations = message.annotations?.filter(
          annotation => (annotation as any)?.type === 'tool_call'
        ) as any[] || []
        
        toolAnnotations.forEach(annotation => {
          if (annotation?.data?.toolName === 'search' && annotation?.data?.result?.images) {
            imagesToProcess.push(...(annotation.data.result.images as SearchResultImage[]))
          }
        })
        
        // Add images to message
        if (imagesToProcess.length > 0) {
          addImagesToMessage(messageEl, imagesToProcess, imageUrls)
        }
        
        container.appendChild(messageEl)
      }
      
      // Append container to body temporarily for html2pdf to work
      document.body.appendChild(container)
      
      // Generate PDF with html2pdf
      const options = {
        margin: 10,
        filename: 'mees-ai-search-results.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      
      // Convert to PDF
      try {
        await html2pdf().from(container).set(options).save()
        toast.success('Search results exported as PDF')
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError)
        toast.error('Failed to generate PDF. Trying HTML export instead.')
        // Fallback to HTML if PDF fails
        handleExportHTML()
      } finally {
        // Clean up
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }
    } catch (error) {
      console.error('Error exporting search results:', error)
      toast.error('Failed to export search results')
    } finally {
      setExporting(false)
    }
  }
  
  // Helper function to add images to the message element
  function addImagesToMessage(
    messageEl: HTMLDivElement, 
    images: SearchResultImage[], 
    imageUrls: string[]
  ) {
    if (images && images.length > 0) {
      // Check if we already have an images section
      let imagesTitle = messageEl.querySelector('.export-images-title') as HTMLHeadingElement
      let imageGrid = messageEl.querySelector('.export-image-grid') as HTMLDivElement
      
      // Create if not exists
      if (!imagesTitle) {
        imagesTitle = document.createElement('h3')
        imagesTitle.textContent = 'Images:'
        imagesTitle.className = 'export-images-title'
        imagesTitle.style.marginTop = '15px'
        imagesTitle.style.marginBottom = '10px'
        messageEl.appendChild(imagesTitle)
        
        imageGrid = document.createElement('div')
        imageGrid.className = 'export-image-grid'
        imageGrid.style.display = 'grid'
        imageGrid.style.gridTemplateColumns = 'repeat(2, 1fr)'
        imageGrid.style.gap = '10px'
        imageGrid.style.marginBottom = '20px'
        messageEl.appendChild(imageGrid)
      }
      
      // Add each image
      images.slice(0, 6).forEach(img => {
        const imgUrl = typeof img === 'string' ? img : img.url
        
        if (imgUrl && !imageUrls.includes(imgUrl)) {
          // Save to our URLs array to avoid duplicates
          imageUrls.push(imgUrl)
          
          // Create image element
          const imgContainer = document.createElement('div')
          const imgEl = document.createElement('img')
          imgEl.src = imgUrl
          imgEl.style.width = '100%'
          imgEl.style.height = 'auto'
          imgEl.style.objectFit = 'cover'
          imgEl.style.border = '1px solid #eee'
          imgEl.style.borderRadius = '4px'
          imgEl.crossOrigin = 'anonymous' // Important for PDF export
          
          imgContainer.appendChild(imgEl)
          imageGrid.appendChild(imgContainer)
        }
      })
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full group"
          type="button"
          disabled={isLoading || exporting || messages.length === 0}
          title="Export with images"
        >
          <Download className="size-4 group-hover:scale-110 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={handleExportHTML}
          disabled={exporting}
        >
          Export as HTML
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleExportPDF}
          disabled={exporting}
        >
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 