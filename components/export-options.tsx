'use client'

import { jsPDF } from 'jspdf'
import { Cloud, Download, FileText, Mail } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from './ui/dropdown-menu'

interface ExportOptionsProps {
  content: string
  title?: string
}

export function ExportOptions({ content, title = 'AI Research Report' }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportAsPDF = async () => {
    setIsExporting(true)
    try {
      // Create PDF document with font embedding
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
      })
      
      // Define page dimensions and margins
      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const usableWidth = pageWidth - (margin * 2)
      const usableHeight = pageHeight - (margin * 2) // Equal margins
      
      // Add title
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(title, margin, margin)
      
      // Process content for PDF
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      
      // More careful markdown cleaning to preserve content
      const plainText = content
        .replace(/#{1,6}\s+(.+)/g, '$1') // Clean headings but keep text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)') // Convert links
        .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, '').trim()) // Clean code blocks
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .replace(/\n\s*\n/g, '\n\n') // Normalize multiple line breaks
      
      // Split text into lines that fit the page width
      const textLines = pdf.splitTextToSize(plainText, usableWidth)
      
      // Calculate line height (slightly reduced for more content per page)
      const lineHeight = 4.8
      
      // Start position after title
      let yPosition = margin + 10
      
      // Add content with pagination
      for (let i = 0; i < textLines.length; i++) {
        // Check if we need a new page
        if (yPosition + lineHeight > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin // Reset Y position for new page
        }
        
        // Add the line of text
        pdf.text(textLines[i], margin, yPosition)
        
        // Move to next line
        yPosition += lineHeight
      }
      
      // Save the PDF
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
    setIsExporting(false)
  }

  const exportAsDoc = () => {
    setIsExporting(true)
    try {
      const blob = new Blob([content], { type: 'application/msword' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${title.replace(/\s+/g, '_')}.doc`
      link.click()
    } catch (error) {
      console.error('Error exporting DOC:', error)
    }
    setIsExporting(false)
  }

  const openInEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(content)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const exportToGoogleDrive = async () => {
    setIsExporting(true)
    try {
      // Create a text file blob
      const fileName = `${title.replace(/\s+/g, '_')}.txt`
      const fileContent = content
      const blob = new Blob([fileContent], { type: 'text/plain' })
      
      // Create a temporary link to download the file first
      const tempLink = document.createElement('a')
      tempLink.href = URL.createObjectURL(blob)
      tempLink.download = fileName
      tempLink.click()
      
      // Open Google Drive in a new tab
      setTimeout(() => {
        window.open('https://drive.google.com/drive/my-drive', '_blank')
      }, 1000)
      
      // Show instructions to the user
      alert('1. File has been downloaded\n2. Google Drive will open in a new tab\n3. Drag and drop the downloaded file into Google Drive')
    } catch (error) {
      console.error('Error preparing file for Google Drive:', error)
    }
    setIsExporting(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Save as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsDoc}>
          <FileText className="h-4 w-4 mr-2" />
          Save as DOC
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openInEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Open in Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToGoogleDrive}>
          <Cloud className="h-4 w-4 mr-2" />
          Save to Google Drive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 