'use client'

import { jsPDF } from 'jspdf'
import { Cloud, Download, FileText, Mail, Database, FileCode, X, BookOpen, List } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { CitationPopup } from './citation-popup'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

interface ExportOptionsProps {
  content: string
  title?: string
  onBulletPointsClick?: () => void
}

export function ExportOptions({ 
  content, 
  title = 'AI Research Report', 
  onBulletPointsClick 
}: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [showCitationPopup, setShowCitationPopup] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()
  
  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportOptions(false)
      }
    }
    
    // Add event listener only when the dropdown is shown
    if (showExportOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportOptions])

  const handleCitationsClick = () => {
    if (!user) {
      toast.error("Please sign in to use citations", {
        position: "bottom-center",
        duration: 2000,
      });
      return;
    }
    setShowCitationPopup(true)
    setShowExportOptions(false)
  }

  const exportAsPDF = async () => {
    setIsExporting(true)
    try {
      toast.info("Preparing PDF with images, please wait...", { duration: 3000 });
      
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
      
      // Extract images for special handling
      const imageRegex = /!\[(.*?)\]\((.*?)\)/g
      const images: { alt: string, url: string, index: number, processed: boolean }[] = []
      let imageMatch: RegExpExecArray | null
      let contentCopy = content
      
      while ((imageMatch = imageRegex.exec(contentCopy)) !== null) {
        images.push({
          alt: imageMatch[1],
          url: imageMatch[2],
          index: imageMatch.index,
          processed: false
        })
      }
      
      // Pre-load all images before starting PDF creation
      toast.info(`Loading ${images.length} images...`, { duration: 2000 });
      
      // Function to load an image and convert to data URL
      const loadImageAsDataUrl = (url: string): Promise<string | null> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          
          // Set up load handler
          img.onload = () => {
            try {
              // Create canvas to get image data
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                // Draw image to canvas
                ctx.drawImage(img, 0, 0);
                
                // Get data URL
                const dataUrl = canvas.toDataURL('image/jpeg');
                resolve(dataUrl);
              } else {
                resolve(null);
              }
            } catch (err) {
              console.error("Error converting image to data URL:", err);
              resolve(null);
            }
          };
          
          // Set up error handler
          img.onerror = () => {
            console.error("Error loading image:", url);
            resolve(null);
          };
          
          // Try to load the image with credentials
          img.crossOrigin = "anonymous";
          img.src = url;
          
          // Set a timeout in case the image takes too long to load
          setTimeout(() => {
            if (!img.complete) {
              console.error("Image load timeout:", url);
              resolve(null);
            }
          }, 5000);
        });
      };
      
      // Try multiple methods to load images
      const loadedImages = await Promise.all(
        images.map(async (img) => {
          // First try direct loading
          let dataUrl = await loadImageAsDataUrl(img.url);
          
          // If direct loading fails, try proxy or other methods
          if (!dataUrl) {
            // Try using a CORS proxy if the image is from a different domain
            if (img.url.startsWith('http') && !img.url.includes(window.location.hostname)) {
              const proxyUrl = `https://cors-anywhere.herokuapp.com/${img.url}`;
              dataUrl = await loadImageAsDataUrl(proxyUrl).catch(() => null);
            }
            
            // If still no success, try a data URL approach for common image types
            if (!dataUrl && img.url.match(/\.(jpeg|jpg|png|gif)$/i)) {
              try {
                const response = await fetch(img.url, { mode: 'no-cors' }).catch(() => null);
                if (response) {
                  const blob = await response.blob().catch(() => null);
                  if (blob) {
                    dataUrl = await new Promise<string | null>((resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.onerror = () => resolve(null);
                      reader.readAsDataURL(blob);
                    });
                  }
                }
              } catch (error) {
                console.error("Error fetching image:", error);
              }
            }
          }
          
          return {
            ...img,
            dataUrl
          };
        })
      );
      
      // Add title
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(title, margin, margin)
      
      // Process content for PDF
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      
      // Extract tables for special handling
      const tableRegex = /(\|[^\n]+\|\n)((?:\|:?[-]+:?)+\|)(\n(?:\|[^\n]+\|\n?)*)/g
      const tables: { match: string, index: number, processed: boolean }[] = []
      let tableMatch: RegExpExecArray | null
      
      while ((tableMatch = tableRegex.exec(contentCopy)) !== null) {
        tables.push({
          match: tableMatch[0],
          index: tableMatch.index,
          processed: false
        })
      }
      
      // Extract citations for reference section
      const citationRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g
      const citations: { text: string, url: string }[] = []
      let citationMatch: RegExpExecArray | null
      
      while ((citationMatch = citationRegex.exec(content)) !== null) {
        // Skip image links
        if (content.substring(citationMatch.index - 1, citationMatch.index) === '!') {
          continue;
        }
        
        citations.push({
          text: citationMatch[1],
          url: citationMatch[2]
        })
      }
      
      // Clean markdown content
      let processedText = content
        .replace(/#{1,6}\s+(.+)/g, '$1') // Clean headings but keep text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)') // Convert links
        .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, '').trim()) // Clean code blocks
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .replace(/\n\s*\n/g, '\n\n') // Normalize multiple line breaks
      
      // Replace tables and images with placeholders
      tables.forEach(table => {
        processedText = processedText.replace(table.match, '\n[TABLE]\n')
      })
      
      images.forEach(image => {
        processedText = processedText.replace(`![${image.alt}](${image.url})`, '\n[IMAGE]\n')
      })
      
      // Split text into lines that fit the page width
      const textLines = pdf.splitTextToSize(processedText, usableWidth)
      
      // Calculate line height
      const lineHeight = 4.8
      
      // Start position after title
      let yPosition = margin + 10
      
      // Add content with pagination
      let i = 0;
      while (i < textLines.length) {
        const line = textLines[i];
        
        // Handle table placeholder
        if (line.trim() === '[TABLE]') {
          // Find the next unprocessed table
          const tableToProcess = tables.find(t => !t.processed);
          if (tableToProcess) {
            tableToProcess.processed = true;
            
            // Add some space before table
            yPosition += lineHeight;
            
            // Parse table content
            const tableLines = tableToProcess.match.split('\n').filter(line => line.trim() !== '');
            const headerRow = tableLines[0];
            // Skip alignment row (second line)
            const dataRows = tableLines.slice(2);
            
            // Extract headers
            const headers = headerRow
              .split('|')
              .filter((cell: string) => cell.trim() !== '')
              .map((cell: string) => cell.trim());
            
            // Calculate column widths
            const colWidth = usableWidth / headers.length;
            
            // Draw header row
            pdf.setFillColor(240, 240, 240);
            pdf.setDrawColor(180, 180, 180);
            
            // Check if we need a new page
            if (yPosition + lineHeight * 2 > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            
            // Draw header cells
            pdf.setFont('helvetica', 'bold');
            headers.forEach((header: string, idx: number) => {
              const x = margin + (idx * colWidth);
              
              // Draw cell background and border
              pdf.rect(x, yPosition - 3, colWidth, lineHeight * 1.5, 'FD');
              
              // Add text
              pdf.text(header, x + 2, yPosition + 1);
            });
            
            // Move to next row
            yPosition += lineHeight * 1.5;
            pdf.setFont('helvetica', 'normal');
            
            // Draw data rows
            dataRows.forEach((row: string) => {
              // Check if we need a new page
              if (yPosition + lineHeight * 1.5 > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
              }
              
              const cells = row
                .split('|')
                .filter((cell: string) => cell.trim() !== '')
                .map((cell: string) => cell.trim());
              
              cells.forEach((cell: string, idx: number) => {
                const x = margin + (idx * colWidth);
                
                // Draw cell border
                pdf.rect(x, yPosition - 3, colWidth, lineHeight * 1.5, 'S');
                
                // Add text
                pdf.text(cell, x + 2, yPosition + 1);
              });
              
              // Move to next row
              yPosition += lineHeight * 1.5;
            });
            
            // Add space after table
            yPosition += lineHeight;
          }
          
          i++;
          continue;
        }
        
        // Handle image placeholder
        if (line.trim() === '[IMAGE]') {
          // Find the next unprocessed image
          const imageToProcess = loadedImages.find(img => !img.processed);
          if (imageToProcess) {
            imageToProcess.processed = true;
            
            // Add some space before image
            yPosition += lineHeight * 2;
            
            // Check if we need a new page
            if (yPosition + 60 > pageHeight - margin) { // Reserve more space for image
              pdf.addPage();
              yPosition = margin + 10;
            }
            
            try {
              if (imageToProcess.dataUrl) {
                // We have a data URL, use it directly
                const imgWidth = usableWidth * 0.8; // 80% of usable width
                const imgHeight = imgWidth * 0.75; // Approximate aspect ratio
                
                pdf.addImage(
                  imageToProcess.dataUrl,
                  'JPEG',
                  margin + (usableWidth - imgWidth) / 2, // Center horizontally
                  yPosition,
                  imgWidth,
                  imgHeight
                );
                
                // Update position
                yPosition += imgHeight + lineHeight;
                
                // Add caption if available
                if (imageToProcess.alt) {
                  pdf.setFontSize(9);
                  pdf.setFont('helvetica', 'italic');
                  
                  const captionLines = pdf.splitTextToSize(
                    `Figure: ${imageToProcess.alt}`,
                    usableWidth
                  );
                  
                  // Center the caption
                  captionLines.forEach((captionLine: string) => {
                    const textWidth = pdf.getStringUnitWidth(captionLine) * 9 * 0.352778; // Convert to mm
                    const xPosition = margin + (usableWidth - textWidth) / 2;
                    pdf.text(captionLine, xPosition, yPosition);
                    yPosition += lineHeight * 0.8;
                  });
                  
                  // Reset font
                  pdf.setFontSize(11);
                  pdf.setFont('helvetica', 'normal');
                  
                  yPosition += lineHeight;
                }
              } else {
                // Try one more approach - direct embedding
                const img = new Image();
                img.crossOrigin = "Anonymous";
                
                await new Promise<void>((resolve) => {
                  img.onload = () => {
                    try {
                      // Calculate dimensions
                      const imgWidth = usableWidth * 0.8;
                      const imgHeight = (img.height / img.width) * imgWidth;
                      
                      // Create canvas
                      const canvas = document.createElement('canvas');
                      canvas.width = img.width;
                      canvas.height = img.height;
                      const ctx = canvas.getContext('2d');
                      
                      if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        const imgData = canvas.toDataURL('image/jpeg');
                        
                        // Add to PDF
                        pdf.addImage(
                          imgData,
                          'JPEG',
                          margin + (usableWidth - imgWidth) / 2,
                          yPosition,
                          imgWidth,
                          imgHeight
                        );
                        
                        yPosition += imgHeight + lineHeight;
                        
                        // Add caption
                        if (imageToProcess.alt) {
                          pdf.setFontSize(9);
                          pdf.setFont('helvetica', 'italic');
                          
                          const caption = `Figure: ${imageToProcess.alt}`;
                          const captionWidth = pdf.getStringUnitWidth(caption) * 9 * 0.352778;
                          pdf.text(caption, margin + (usableWidth - captionWidth) / 2, yPosition);
                          
                          pdf.setFontSize(11);
                          pdf.setFont('helvetica', 'normal');
                          yPosition += lineHeight * 1.5;
                        }
                      }
                    } catch (err) {
                      console.error("Error embedding image:", err);
                      pdf.setFont('helvetica', 'italic');
                      pdf.text(`[Image: ${imageToProcess.alt || 'Figure'}]`, margin, yPosition);
                      pdf.text(`(${imageToProcess.url})`, margin, yPosition + lineHeight);
                      pdf.setFont('helvetica', 'normal');
                      yPosition += lineHeight * 3;
                    }
                    resolve();
                  };
                  
                  img.onerror = () => {
                    pdf.setFont('helvetica', 'italic');
                    pdf.text(`[Image: ${imageToProcess.alt || 'Figure'}]`, margin, yPosition);
                    pdf.text(`(${imageToProcess.url})`, margin, yPosition + lineHeight);
                    pdf.setFont('helvetica', 'normal');
                    yPosition += lineHeight * 3;
                    resolve();
                  };
                  
                  // Set a timeout
                  const timeout = setTimeout(() => {
                    if (!img.complete) {
                      img.src = ''; // Cancel the load
                      pdf.setFont('helvetica', 'italic');
                      pdf.text(`[Image: ${imageToProcess.alt || 'Figure'}]`, margin, yPosition);
                      pdf.text(`(${imageToProcess.url})`, margin, yPosition + lineHeight);
                      pdf.setFont('helvetica', 'normal');
                      yPosition += lineHeight * 3;
                      resolve();
                    }
                  }, 3000);
                  
                  img.src = imageToProcess.url;
                });
              }
            } catch (err) {
              console.error('Error embedding image:', err);
              // Fallback to text placeholder
              pdf.setFont('helvetica', 'italic');
              pdf.text(`[Image: ${imageToProcess.alt || 'Figure'}]`, margin, yPosition);
              pdf.setFont('helvetica', 'normal');
              yPosition += lineHeight * 2;
            }
          }
          
          i++;
          continue;
        }
        
        // Check if we need a new page
        if (yPosition + lineHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin; // Reset Y position for new page
        }
        
        // Add the line of text
        pdf.text(line, margin, yPosition);
        
        // Move to next line
        yPosition += lineHeight;
        i++;
      }
      
      // Add citations/references section if we have any
      if (citations.length > 0) {
        // Add a new page for references if we're near the bottom
        if (yPosition + lineHeight * 4 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        } else {
          // Just add some space
          yPosition += lineHeight * 2;
        }
        
        // Add references header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('References', margin, yPosition);
        yPosition += lineHeight * 2;
        
        // Reset font
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        // Add each citation
        citations.forEach((citation, index) => {
          // Format citation text
          const citationText = `${index + 1}. ${citation.text} (${citation.url})`;
          
          // Split long citations into multiple lines
          const citationLines = pdf.splitTextToSize(citationText, usableWidth);
          
          // Check if we need a new page
          if (yPosition + (citationLines.length * lineHeight) > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Add each line of the citation
          citationLines.forEach((line: string) => {
            pdf.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
          
          // Add space between citations
          yPosition += lineHeight * 0.5;
        });
      }
      
      // Save the PDF
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.');
    }
    setIsExporting(false);
  }

  const exportAsDoc = () => {
    setIsExporting(true)
    try {
      toast.info("Preparing Word document with images, please wait...", { duration: 3000 });
      
      // Create a proper Word document with enhanced formatting
      const header = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
xmlns:w='urn:schemas-microsoft-com:office:word' 
xmlns:v='urn:schemas-microsoft-com:vml'
xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${title}</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>90</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<!--[if gte mso 9]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
<style>
body {
  font-family: 'Calibri', sans-serif;
  font-size: 11pt;
  line-height: 1.5;
}
h1, h2, h3, h4, h5, h6 {
  font-family: 'Calibri', sans-serif;
  margin-top: 12pt;
  margin-bottom: 6pt;
  font-weight: bold;
}
h1 { font-size: 16pt; }
h2 { font-size: 14pt; }
h3 { font-size: 12pt; }
p { margin: 6pt 0; }
img { max-width: 100%; height: auto; }
table {
  border-collapse: collapse;
  width: 100%;
  margin: 12pt 0;
}
th, td {
  border: 1pt solid #d1d5db;
  padding: 8pt;
  text-align: left;
}
th {
  background-color: #f3f4f6;
  font-weight: bold;
}
.citation {
  color: #2563eb;
  text-decoration: none;
}
.citation-note {
  font-size: 9pt;
  color: #4b5563;
  margin-top: 4pt;
}
.reference-section {
  margin-top: 24pt;
  border-top: 1pt solid #d1d5db;
  padding-top: 12pt;
}
.reference-item {
  margin-bottom: 8pt;
  padding-left: 24pt;
  text-indent: -24pt;
}
pre, code {
  font-family: Consolas, 'Courier New', monospace;
  background-color: #f3f4f6;
  padding: 1pt 4pt;
  border-radius: 2pt;
}
pre {
  padding: 8pt;
  margin: 12pt 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.image-container {
  margin: 12pt 0;
  text-align: center;
  page-break-inside: avoid;
}
.image-caption {
  font-style: italic;
  font-size: 9pt;
  margin-top: 4pt;
  text-align: center;
}
v\\:* { behavior: url(#default#VML); }
o\\:* { behavior: url(#default#VML); }
w\\:* { behavior: url(#default#VML); }
.shape { behavior: url(#default#VML); }
</style>
</head>
<body>
<h1>${title}</h1>
`;

      // Process content by converting markdown to enhanced HTML
      
      // Step 1: Extract citations for later reference
      const citationRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
      const citations: Array<{text: string, url: string}> = [];
      let citationMatch: RegExpExecArray | null;
      while ((citationMatch = citationRegex.exec(content)) !== null) {
        // Skip image links
        if (content.substring(citationMatch.index - 1, citationMatch.index) === '!') {
          continue;
        }
        
        citations.push({
          text: citationMatch[1],
          url: citationMatch[2]
        });
      }
      
      // Step 2: Process markdown tables
      // Find all markdown tables and convert them to HTML tables
      const tableRegex = /(\|[^\n]+\|\n)((?:\|:?[-]+:?)+\|)(\n(?:\|[^\n]+\|\n?)*)/g;
      let htmlContent = content.replace(tableRegex, (match, headerRow, alignmentRow, bodyRows) => {
        // Process header row
        const headers = headerRow
          .trim()
          .split('|')
          .filter((cell: string) => cell.trim() !== '')
          .map((cell: string) => cell.trim());
          
        // Process alignment row to determine text alignment
        const alignments = alignmentRow
          .trim()
          .split('|')
          .filter((cell: string) => cell.trim() !== '')
          .map((cell: string) => {
            if (cell.trim().startsWith(':') && cell.trim().endsWith(':')) return 'center';
            if (cell.trim().endsWith(':')) return 'right';
            return 'left';
          });
          
        // Process body rows
        const rows = bodyRows
          .trim()
          .split('\n')
          .map((row: string) => 
            row
              .trim()
              .split('|')
              .filter((cell: string) => cell.trim() !== '')
              .map((cell: string) => cell.trim())
          );
          
        // Build HTML table with Word-specific attributes
        let htmlTable = '<table border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse; width:100%">\n<thead>\n<tr>\n';
        
        // Add headers
        headers.forEach((header: string, i: number) => {
          const alignment = i < alignments.length ? alignments[i] : 'left';
          htmlTable += `<th style="text-align: ${alignment}; background-color: #f3f4f6; font-weight: bold;">${header}</th>\n`;
        });
        
        htmlTable += '</tr>\n</thead>\n<tbody>\n';
        
        // Add rows
        rows.forEach((row: string[]) => {
          htmlTable += '<tr>\n';
          row.forEach((cell: string, i: number) => {
            const alignment = i < alignments.length ? alignments[i] : 'left';
            htmlTable += `<td style="text-align: ${alignment};">${cell}</td>\n`;
          });
          htmlTable += '</tr>\n';
        });
        
        htmlTable += '</tbody>\n</table>';
        return htmlTable;
      });
      
      // Step 3: Process standard markdown elements
      htmlContent = htmlContent
        .replace(/#{6}\s+(.+)/g, '<h6>$1</h6>')
        .replace(/#{5}\s+(.+)/g, '<h5>$1</h5>')
        .replace(/#{4}\s+(.+)/g, '<h4>$1</h4>')
        .replace(/#{3}\s+(.+)/g, '<h3>$1</h3>')
        .replace(/#{2}\s+(.+)/g, '<h2>$1</h2>')
        .replace(/#{1}\s+(.+)/g, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
        
      // Step 4: Process images with proper formatting for Word using multiple approaches for better compatibility
      htmlContent = htmlContent.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
        // Generate a unique ID for each image
        const imageId = `img_${Math.random().toString(36).substring(2, 11)}`;
        
        // Use multiple approaches for maximum compatibility
        return `
<div class="image-container">
  <!-- VML approach for older Word versions -->
  <!--[if gte vml 1]>
  <v:shapetype id="shapetype_${imageId}" coordsize="21600,21600" o:spt="75" o:preferrelative="t" path="m@4@5l@4@11@9@11@9@5xe" filled="f" stroked="f">
    <v:stroke joinstyle="miter"/>
    <v:formulas>
      <v:f eqn="if lineDrawn pixelLineWidth 0"/>
      <v:f eqn="sum @0 1 0"/>
      <v:f eqn="sum 0 0 @1"/>
      <v:f eqn="prod @2 1 2"/>
      <v:f eqn="prod @3 21600 pixelWidth"/>
      <v:f eqn="prod @3 21600 pixelHeight"/>
      <v:f eqn="sum @0 0 1"/>
      <v:f eqn="prod @6 1 2"/>
      <v:f eqn="prod @7 21600 pixelWidth"/>
      <v:f eqn="sum @8 21600 0"/>
      <v:f eqn="prod @7 21600 pixelHeight"/>
      <v:f eqn="sum @10 21600 0"/>
    </v:formulas>
    <v:path o:extrusionok="f" gradientshapeok="t" o:connecttype="rect"/>
    <o:lock v:ext="edit" aspectratio="t"/>
  </v:shapetype>
  <v:shape id="${imageId}" type="#shapetype_${imageId}" style="width:400pt;height:auto" stroked="f">
    <v:imagedata src="${url}" o:title="${alt || 'Image'}"/>
  </v:shape>
  <![endif]-->
  
  <!-- Standard HTML for modern Word and fallback -->
  <!--[if !vml]-->
  <img src="${url}" alt="${alt || 'Image'}" width="400" style="max-width:100%; height:auto; display:block; margin:0 auto;" border="0"/>
  <!--[endif]-->
  
  <!-- Caption for the image -->
  ${alt ? `<p class="image-caption">Figure: ${alt}</p>` : ''}
</div>`;
      });
      
      // Step 5: Process links and citations
      htmlContent = htmlContent.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
        // Check if this is a citation (based on format or URL pattern)
        const isCitation = url.includes('doi.org') || 
                          url.includes('citation') || 
                          /\[\d+\]/.test(text);
                          
        if (isCitation) {
          return `<a href="${url}" class="citation">${text}</a>`;
        } else {
          return `<a href="${url}">${text}</a>`;
        }
      });
      
      // Step 6: Add references section if citations were found
      let referencesSection = '';
      if (citations.length > 0) {
        referencesSection = `
        <div class="reference-section">
          <h2>References</h2>
          <ol>
            ${citations.map((citation, index) => 
              `<li class="reference-item">${citation.text} <a href="${citation.url}">${citation.url}</a></li>`
            ).join('\n')}
          </ol>
        </div>
        `;
      }

      // Wrap content in paragraphs if not already wrapped
      if (!htmlContent.startsWith('<h') && !htmlContent.startsWith('<p>') && !htmlContent.startsWith('<table') && !htmlContent.startsWith('<div class="image-container"')) {
        htmlContent = '<p>' + htmlContent;
      }
      if (!htmlContent.endsWith('</p>') && !htmlContent.endsWith('</h1>') && 
          !htmlContent.endsWith('</h2>') && !htmlContent.endsWith('</h3>') && 
          !htmlContent.endsWith('</h4>') && !htmlContent.endsWith('</h5>') && 
          !htmlContent.endsWith('</h6>') && !htmlContent.endsWith('</table>') &&
          !htmlContent.endsWith('</div>')) {
        htmlContent += '</p>';
      }

      const footer = referencesSection + '</body></html>';
      const fullDoc = header + htmlContent + footer;

      const blob = new Blob([fullDoc], { type: 'application/msword' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, '_')}.doc`;
      link.click();
      
      toast.success("Word document exported successfully!");
    } catch (error) {
      console.error('Error exporting DOC:', error);
      toast.error('Failed to export document. Please try again.');
    }
    setIsExporting(false);
  }

  const openInEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(content)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const exportToGoogleDocs = async () => {
    setIsExporting(true)
    try {
      // Create HTML content optimized for Google Docs with enhanced formatting
      const htmlHeader = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.5; }
    h1 { font-size: 24pt; margin-bottom: 16pt; }
    h2 { font-size: 18pt; margin-top: 16pt; }
    h3 { font-size: 14pt; }
    img { max-width: 100%; height: auto; display: block; margin: 12pt auto; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; white-space: pre-wrap; }
    code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
    table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f5f5f5; text-align: left; }
    .citation { color: #2563eb; }
    .reference-section { margin-top: 24pt; border-top: 1px solid #ddd; padding-top: 12pt; }
    .reference-item { margin-bottom: 8pt; }
    .image-container { margin: 20px auto; text-align: center; max-width: 100%; }
    .image-caption { font-style: italic; color: #555; text-align: center; margin-top: 8px; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${title}</h1>
`;

      // Extract citations for later reference
      const citationRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
      const citations: Array<{text: string, url: string}> = [];
      let citationMatch: RegExpExecArray | null;
      let contentCopy = content;
      while ((citationMatch = citationRegex.exec(content)) !== null) {
        // Skip image links
        if (content.substring(citationMatch.index - 1, citationMatch.index) === '!') {
          continue;
        }
        
        citations.push({
          text: citationMatch[1],
          url: citationMatch[2]
        });
      }
      
      // Extract images for special handling
      const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
      const images: Array<{alt: string, url: string}> = [];
      let imageMatch: RegExpExecArray | null;
      
      while ((imageMatch = imageRegex.exec(content)) !== null) {
        images.push({
          alt: imageMatch[1],
          url: imageMatch[2]
        });
      }
      
      // Process markdown tables
      const tableRegex = /(\|[^\n]+\|\n)((?:\|:?[-]+:?)+\|)(\n(?:\|[^\n]+\|\n?)*)/g;
      let htmlContent = contentCopy.replace(tableRegex, (match, headerRow, alignmentRow, bodyRows) => {
        // Process header row
        const headers: string[] = headerRow
          .trim()
          .split('|')
          .filter((cell: string) => cell.trim() !== '')
          .map((cell: string) => cell.trim());
          
        // Process alignment row to determine text alignment
        const alignments: string[] = alignmentRow
          .trim()
          .split('|')
          .filter((cell: string) => cell.trim() !== '')
          .map((cell: string) => {
            if (cell.trim().startsWith(':') && cell.trim().endsWith(':')) return 'center';
            if (cell.trim().endsWith(':')) return 'right';
            return 'left';
          });
          
        // Process body rows
        const rows: string[][] = bodyRows
          .trim()
          .split('\n')
          .map((row: string) => 
            row
              .trim()
              .split('|')
              .filter((cell: string) => cell.trim() !== '')
              .map((cell: string) => cell.trim())
          );
          
        // Build HTML table
        let htmlTable = '<table>\n<thead>\n<tr>\n';
        
        // Add headers
        headers.forEach((header: string, i: number) => {
          const alignment = i < alignments.length ? alignments[i] : 'left';
          htmlTable += `<th style="text-align: ${alignment}">${header}</th>\n`;
        });
        
        htmlTable += '</tr>\n</thead>\n<tbody>\n';
        
        // Add rows
        rows.forEach((row: string[]) => {
          htmlTable += '<tr>\n';
          row.forEach((cell: string, i: number) => {
            const alignment = i < alignments.length ? alignments[i] : 'left';
            htmlTable += `<td style="text-align: ${alignment}">${cell}</td>\n`;
          });
          htmlTable += '</tr>\n';
        });
        
        htmlTable += '</tbody>\n</table>';
        return htmlTable;
      });
      
      // Process standard markdown elements
      htmlContent = htmlContent
        .replace(/#{6}\s+(.+)/g, '<h6>$1</h6>')
        .replace(/#{5}\s+(.+)/g, '<h5>$1</h5>')
        .replace(/#{4}\s+(.+)/g, '<h4>$1</h4>')
        .replace(/#{3}\s+(.+)/g, '<h3>$1</h3>')
        .replace(/#{2}\s+(.+)/g, '<h2>$1</h2>')
        .replace(/#{1}\s+(.+)/g, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
        
      // Process images with proper formatting
      htmlContent = htmlContent.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
        // Check if URL is a data URL or remote URL
        const isDataUrl = url.startsWith('data:');
        
        // For Google Docs, we need to ensure images are properly formatted
        return `
<div class="image-container">
  <img src="${url}" alt="${alt || 'Image'}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
  ${alt ? `<div class="image-caption">Figure: ${alt}</div>` : ''}
</div>`;
      });
      
      // Process links and citations
      htmlContent = htmlContent.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
        // Check if this is a citation
        const isCitation = url.includes('doi.org') || 
                           url.includes('citation') || 
                           /\[\d+\]/.test(text);
                           
        if (isCitation) {
          return `<a href="${url}" class="citation">${text}</a>`;
        } else {
          return `<a href="${url}">${text}</a>`;
        }
      });
      
      // Add references section if citations were found
      let referencesSection = '';
      if (citations.length > 0) {
        referencesSection = `
        <div class="reference-section">
          <h2>References</h2>
          <ol>
            ${citations.map((citation, index) => 
              `<li class="reference-item">${citation.text} <a href="${citation.url}">${citation.url}</a></li>`
            ).join('\n')}
          </ol>
        </div>
        `;
      }
      
      // Ensure content is properly wrapped
      if (!htmlContent.startsWith('<h') && !htmlContent.startsWith('<p>') && 
          !htmlContent.startsWith('<table') && !htmlContent.startsWith('<div')) {
        htmlContent = '<p>' + htmlContent;
      }
      if (!htmlContent.endsWith('</p>') && !htmlContent.endsWith('</h1>') && 
          !htmlContent.endsWith('</h2>') && !htmlContent.endsWith('</h3>') && 
          !htmlContent.endsWith('</h4>') && !htmlContent.endsWith('</h5>') && 
          !htmlContent.endsWith('</h6>') && !htmlContent.endsWith('</table>') &&
          !htmlContent.endsWith('</div>')) {
        htmlContent += '</p>';
      }
      
      const htmlFooter = referencesSection + '</body></html>';
      const fullHtml = htmlHeader + htmlContent + htmlFooter;

      // Create a blob with HTML content
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, '_')}.html`;
      link.click();
      
      // Open Google Docs in a new tab
      setTimeout(() => {
        window.open('https://docs.google.com/document/create', '_blank');
      }, 500);
      
      // Display instructions
      toast.info(
        'To import your document:\n1. Google Docs will open in a new tab\n2. Go to File > Open > Upload and select the downloaded HTML file',
        { duration: 6000 }
      );
    } catch (error) {
      console.error('Error preparing file for Google Docs:', error);
      toast.error('Failed to export document. Please try again.');
    }
    setIsExporting(false);
  }

  const exportToNotion = async () => {
    setIsExporting(true)
    try {
      // Extract citations for reference section
      const citationRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
      const citations: Array<{text: string, url: string}> = [];
      let citationMatch: RegExpExecArray | null;
      let contentCopy = content;
      
      while ((citationMatch = citationRegex.exec(content)) !== null) {
        // Skip image links
        if (content.substring(citationMatch.index - 1, citationMatch.index) === '!') {
          continue;
        }
        
        citations.push({
          text: citationMatch[1],
          url: citationMatch[2]
        });
      }
      
      // Process content to ensure tables are properly formatted for Notion
      // Notion requires proper markdown table formatting with alignment indicators
      const tableRegex = /(\|[^\n]+\|\n)((?:\|:?[-]+:?)+\|)(\n(?:\|[^\n]+\|\n?)*)/g;
      let enhancedContent = content;
      
      // Make sure tables have proper spacing around them for Notion
      enhancedContent = enhancedContent.replace(tableRegex, (match) => {
        return '\n\n' + match + '\n\n';
      });
      
      // Make sure images have proper spacing
      enhancedContent = enhancedContent.replace(/!\[(.*?)\]\((.*?)\)/g, (match) => {
        return '\n\n' + match + '\n\n';
      });
      
      // Add a references section if citations were found
      if (citations.length > 0) {
        enhancedContent += '\n\n## References\n\n';
        citations.forEach((citation, index) => {
          enhancedContent += `${index + 1}. [${citation.text}](${citation.url})\n`;
        });
      }
      
      // Format the final markdown document with title and content
      const markdownContent = `# ${title}\n\n${enhancedContent}`;
      
      // Create a blob with markdown content
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, '_')}.md`;
      link.click();
      
      // Open Notion in a new tab
      setTimeout(() => {
        window.open('https://www.notion.so/', '_blank');
      }, 500);
      
      // Display instructions
      toast.info(
        'To import your document:\n1. Notion will open in a new tab\n2. Click Import and select the downloaded .md file',
        { duration: 6000 }
      );
    } catch (error) {
      console.error('Error preparing file for Notion:', error);
      toast.error('Failed to export document. Please try again.');
    }
    setIsExporting(false);
  }

  return (
    <>
      <div className="flex items-center space-x-2" ref={menuRef}>
        <Button 
          variant="ghost" 
          size="icon"
          disabled={isExporting}
          onClick={() => setShowExportOptions(!showExportOptions)}
          title="Export"
          aria-label="Export options"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        {onBulletPointsClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBulletPointsClick}
          >
            <List className="h-4 w-4 mr-2" />
            Bullet Points
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCitationsClick}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Citations
        </Button>
        
        {showExportOptions && (
          <div className="absolute right-0 mt-2 w-56 bg-popover rounded-md shadow-md border z-50 p-1">
            <div className="flex justify-between items-center px-2 py-1.5">
              <span className="text-xs font-medium">Export Options</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0" 
                onClick={() => setShowExportOptions(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="py-1">            
              {onBulletPointsClick && (
                <>
                  <button 
                    className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                    onClick={() => {
                      onBulletPointsClick();
                      setShowExportOptions(false);
                    }}
                  >
                    <List className="h-4 w-4 mr-2" />
                    Bullet Points
                  </button>
                  
                  <div className="h-px bg-muted my-1"></div>
                </>
              )}
              
              <button 
                className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                onClick={() => {
                  handleCitationsClick();
                  setShowExportOptions(false);
                }}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Citations
              </button>
              
              <div className="h-px bg-muted my-1"></div>
              
              <button 
                className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                onClick={() => {
                  exportAsPDF();
                  setShowExportOptions(false);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF Document
              </button>
              
              <button 
                className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                onClick={() => {
                  exportAsDoc();
                  setShowExportOptions(false);
                }}
              >
                <FileCode className="h-4 w-4 mr-2" />
                Microsoft Word
              </button>
              
              <div className="h-px bg-muted my-1"></div>
              
              <button 
                className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                onClick={() => {
                  exportToGoogleDocs();
                  setShowExportOptions(false);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Google Docs
              </button>
              
              <button 
                className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                onClick={() => {
                  exportToNotion();
                  setShowExportOptions(false);
                }}
              >
                <Database className="h-4 w-4 mr-2" />
                Notion
              </button>
              
              <div className="h-px bg-muted my-1"></div>
              
              <button 
                className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                onClick={() => {
                  openInEmail();
                  setShowExportOptions(false);
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send via Email
              </button>
            </div>
          </div>
        )}
      </div>
      
      {showCitationPopup && (
        <CitationPopup 
          onClose={() => setShowCitationPopup(false)} 
          content={content}
        />
      )}
    </>
  )
} 