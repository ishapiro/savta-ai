// Shared text rendering utility for memory books
// Handles high-resolution text rendering for both stories and captions

import sharp from 'sharp'
import he from 'he'

/**
 * Escape XML/SVG special characters using the he library
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export function escapeXml(text) {
  return he.escape(text)
    .replace(/\n/g, ' ')  // Replace newlines with spaces
    .replace(/\r/g, ' ')  // Replace carriage returns with spaces
    .replace(/\t/g, ' ')  // Replace tabs with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\x20-\x7E]/g, '') // Remove any non-printable ASCII characters
    .replace(/[–—]/g, '-') // Replace em dashes and en dashes with regular hyphens
    .replace(/[""]/g, '"') // Replace smart quotes with regular quotes
    .replace(/['']/g, "'") // Replace smart apostrophes with regular apostrophes
    .replace(/[…]/g, '...') // Replace ellipsis with three dots
    .replace(/[•]/g, '*') // Replace bullet points with asterisks
}

/**
 * Wrap text to fit within specified width
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} fontSize - Font size in pixels
 * @returns {string[]} - Array of text lines
 */
export function wrapText(text, maxWidth, fontSize) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    // More accurate width calculation for Garamond
    const estimatedWidth = testLine.length * fontSize * 0.65
    
    if (estimatedWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

/**
 * Auto-adjust font size to fit text within specified dimensions
 * @param {string} text - Text to fit
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} startFontSize - Starting font size (default: 15)
 * @param {number} lineHeight - Line height multiplier (default: 1.4)
 * @returns {Object} - Object containing lines and final font size
 */
export function autoSizeText(text, maxWidth, maxHeight, startFontSize = 15, lineHeight = 1.4) {
  let fontSize = startFontSize
  let lines = []
  let wasTruncated = false
  
  console.log(`📝 Auto-sizing text: "${text.substring(0, 50)}..."`)
  console.log(`📏 Available space: ${maxWidth}x${maxHeight}px`)
  
  // Try to fit text with font size reduction
  for (let attempt = 0; attempt < 20; attempt++) {
    // Re-wrap text with current font size to get optimal line breaks
    lines = wrapText(text, maxWidth, fontSize)
    const totalHeight = lines.length * fontSize * lineHeight
    
    console.log(`🔄 Attempt ${attempt + 1}: ${fontSize}px font, ${lines.length} lines, ${totalHeight}px height`)
    
    // More aggressive fit criteria - leave more room
    if (totalHeight <= maxHeight * 0.9) {
      console.log(`✅ Text fits comfortably at ${fontSize}px font size`)
      break // Font size fits with room to spare
    } else {
      // More aggressive font size reduction
      fontSize = Math.max(3, fontSize - 2) // Reduce by 2px, allow even smaller minimum
    }
  }
  
  // If text still doesn't fit, truncate it
  const totalHeight = lines.length * fontSize * lineHeight
  if (totalHeight > maxHeight * 0.9 || fontSize <= 3) {
    console.warn('⚠️ Text still too long after font reduction, truncating with ellipsis')
    wasTruncated = true
    
    // Calculate how many lines we can fit (with more conservative estimate)
    const maxLines = Math.floor((maxHeight * 0.9) / (fontSize * lineHeight))
    console.log(`📏 Can fit ${maxLines} lines at ${fontSize}px font size`)
    
    // Re-wrap text and limit to max lines
    lines = wrapText(text, maxWidth, fontSize)
    
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines)
      
      // Add ellipsis to the last line
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1]
        // Remove 3 characters and add ellipsis, but ensure we don't go negative
        const charsToRemove = Math.min(3, lastLine.length)
        const truncatedLine = lastLine.substring(0, lastLine.length - charsToRemove)
        lines[lines.length - 1] = truncatedLine + '...'
        console.log(`✂️ Truncated last line to: "${lines[lines.length - 1]}"`)
      }
    }
  }
  
  const finalHeight = lines.length * fontSize * lineHeight
  console.log(`📊 Final result: ${fontSize}px font, ${lines.length} lines, ${finalHeight}px height${wasTruncated ? ' (truncated)' : ''}`)
  
  return { lines, fontSize, wasTruncated }
}

/**
 * Render high-quality text using Sharp with auto-sizing at 300 DPI
 * @param {string} text - Text to render
 * @param {number} width - Target width in pixels
 * @param {number} height - Target height in pixels
 * @param {Object} options - Rendering options
 * @returns {Promise<Buffer>} - PNG image buffer
 */
export async function renderTextToImage(text, width, height, options = {}) {
  const {
    startFontSize = 15,
    lineHeight = 1.4,
    padding = 2, // Reduced from 8 to 2 for much tighter margins
    color = '#2D1810',
    dpi = 300, // Print-quality DPI
    scale = 4   // Higher scale for 300 DPI rendering
  } = options
  
  try {
    console.log('🎨 Rendering high-quality text at 300 DPI with Sharp...')
    
    // Validate input dimensions
    if (!width || !height || width <= 0 || height <= 0) {
      throw new Error(`Invalid dimensions: width=${width}, height=${height}`)
    }
    
    // Calculate dimensions
    const maxWidth = width - (padding * 2)
    const maxHeight = height - (padding * 2)
    
    console.log(`📏 Text rendering dimensions: ${width}x${height}, available: ${maxWidth}x${maxHeight}, padding: ${padding}`)
    
    // Auto-adjust font size to fit
    const { lines, fontSize, wasTruncated } = autoSizeText(text, maxWidth, maxHeight, startFontSize, lineHeight)
    
    console.log(`📏 Auto-sized text: ${fontSize}px font, ${lines.length} lines${wasTruncated ? ' (truncated)' : ''}`)
    
    // Create ultra high-resolution transparent background image for 300 DPI
    const scaledWidth = width * scale
    const scaledHeight = height * scale
    const scaledFontSize = fontSize * scale
    const scaledPadding = padding * scale
    
    // Create SVG with EB Garamond font and exact dimensions
    const svgContent = `<svg width="${scaledWidth}" height="${scaledHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&amp;display=swap');
          .text { 
            font-family: 'EB Garamond', serif; 
            fill: ${color}; 
            text-rendering: optimizeLegibility;
            font-feature-settings: "liga" 1, "kern" 1;
          }
        </style>
      </defs>
      <rect width="${scaledWidth}" height="${scaledHeight}" fill="transparent"/>
      ${lines.map((line, i) => {
        const y = scaledPadding + scaledFontSize + (i * scaledFontSize * lineHeight)
        const escapedLine = escapeXml(line)
        console.log(`📝 Line ${i + 1}: "${line}" → "${escapedLine}"`)
        return `<text x="${scaledPadding}" y="${y}" class="text" font-size="${scaledFontSize}" font-weight="400">${escapedLine}</text>`
      }).join('')}
    </svg>`
    
    console.log(`🎨 Creating SVG with ${lines.length} lines, font size: ${scaledFontSize}px, dimensions: ${scaledWidth}x${scaledHeight}`)
    
    // Debug: Log the first few characters of the SVG to identify problematic characters
    console.log(`🔍 SVG preview (first 200 chars): ${svgContent.substring(0, 200)}`)
    
    // Create the image directly from SVG content
    const buffer = await sharp(Buffer.from(svgContent))
      .resize(width, height, { 
        kernel: 'lanczos3',
        fit: 'fill'
      })
      .png({
        quality: 100,
        compressionLevel: 0,
        adaptiveFiltering: false,
        force: true
      })
      .toBuffer()
    
    console.log('✅ High-quality text rendered successfully at 300 DPI with Sharp')
    return buffer
    
  } catch (error) {
    console.warn('⚠️ Sharp text rendering failed:', error.message)
    throw error // Let caller handle fallback
  }
}

/**
 * Create caption image with text rendering at 300 DPI
 * @param {string} captionText - Caption text to render
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {Object} options - Rendering options
 * @returns {Promise<Buffer>} - PNG image buffer
 */
export async function createCaptionImage(captionText, maxWidth, maxHeight, options = {}) {
  const {
    startFontSize = 12, // Smaller font for captions
    lineHeight = 1.3,   // Tighter line height for captions
    padding = 6,         // Smaller padding for captions
    color = '#2D1810',
    dpi = 300,          // Print-quality DPI
    scale = 4           // Higher scale for 300 DPI rendering
  } = options
  
  return await renderTextToImage(captionText, maxWidth, maxHeight, {
    startFontSize,
    lineHeight,
    padding,
    color,
    dpi,
    scale
  })
}

/**
 * Get PDF fallback font configuration
 * @param {string} fontName - Font name (default: 'Times-Roman')
 * @returns {Object} - Font configuration object
 */
export function getPdfFallbackConfig(fontName = 'Times-Roman') {
  return {
    fontName,
    fontSize: 15,
    lineHeight: 1.4,
    color: { r: 0.176, g: 0.094, b: 0.063 } // #2D1810
  }
} 