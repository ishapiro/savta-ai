// Shared text rendering utility for memory books
// Handles high-resolution text rendering for both stories and captions

import sharp from 'sharp'
import he from 'he'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load embedded EB Garamond Italic font
const fontPath = join(process.cwd(), 'assets', 'fonts', 'EBGaramond-Italic.ttf')
let embeddedFont = null

try {
  embeddedFont = readFileSync(fontPath)
  console.log('✅ EB Garamond Italic font loaded successfully')
} catch (error) {
  console.warn('⚠️ Could not load embedded font, falling back to web font:', error.message)
}


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
 * Wrap text to fit within specified width using improved character-based estimation
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} fontSize - Font size in pixels
 * @returns {string[]} - Array of text lines
 */
export function wrapText(text, maxWidth, fontSize) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  
  // Improved character width estimation for EB Garamond font
  const getCharWidth = (char) => {
    // Narrow characters
    if ('ijl|.,;:!?\'"`~()[]{}'.includes(char)) return fontSize * 0.26
    // Medium characters  
    if ('abcdefghkmnopqrstuvwxyz0123456789'.includes(char)) return fontSize * 0.52
    // Wide characters
    if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(char)) return fontSize * 0.65
    // Extra wide characters
    if ('MW'.includes(char)) return fontSize * 0.79
    // Space character
    if (char === ' ') return fontSize * 0.40
    // Default for other characters
    return fontSize * 0.52
  }
  
  const measureTextWidth = (text) => {
    return text.split('').reduce((width, char) => width + getCharWidth(char), 0)
  }
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    const width = measureTextWidth(testLine)
    
    if (width <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
}

/**
 * Auto-adjust font size to fit text within specified dimensions
 * @param {string} text - Text to fit
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} startFontSize - Starting font size (default: 16)
 * @param {number} lineHeight - Line height multiplier (default: 1.4)
 * @returns {Object} - Object containing lines and final font size
 */
export function autoSizeText(text, maxWidth, maxHeight, startFontSize = 16, lineHeight = 1.4) {
  // Clean the input text to ensure it's a single string with no line breaks
  const cleanText = text.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\s+/g, ' ').trim()
  
  let bestFontSize = startFontSize
  let bestLines = []
  let wasTruncated = false
  
  // Try different font sizes from largest to smallest
  for (let fontSize = startFontSize; fontSize >= 8; fontSize--) {
    // Use the wrapText function which properly calculates line breaks with accurate measurement
    const lines = wrapText(cleanText, maxWidth, fontSize)
    
    // Calculate total height needed
    const totalHeight = lines.length * fontSize * lineHeight
    
    // Check if this font size fits
    if (totalHeight <= maxHeight * 0.9) {
      bestFontSize = fontSize
      bestLines = lines
      break
    }
  }
  
  // If no font size fits, use the smallest and truncate
  if (bestLines.length === 0) {
    console.warn('⚠️ No font size fits, using smallest size and truncating')
    wasTruncated = true
    bestFontSize = 8
    
    const lines = wrapText(cleanText, maxWidth, bestFontSize)
    
    // Calculate how many lines we can fit
    const maxLines = Math.floor((maxHeight * 0.9) / (bestFontSize * lineHeight))
    
    if (lines.length > maxLines) {
      bestLines = lines.slice(0, maxLines)
      
      // Add ellipsis to the last line
      if (bestLines.length > 0) {
        const lastLine = bestLines[bestLines.length - 1]
        const charsToRemove = Math.min(3, lastLine.length)
        const truncatedLine = lastLine.substring(0, lastLine.length - charsToRemove)
        bestLines[bestLines.length - 1] = truncatedLine + '...'
      }
    }
  }
  
  return { lines: bestLines, fontSize: bestFontSize, wasTruncated }
}

/**
 * Render high-quality text using Sharp's native text rendering at 600 DPI
 * @param {string} text - Text to render
 * @param {number} width - Target width in pixels
 * @param {number} height - Target height in pixels
 * @param {Object} options - Rendering options
 * @returns {Promise<Buffer>} - PNG image buffer
 */
export async function renderTextToImage(text, width, height, options = {}) {
  const {
    startFontSize = 16,
    lineHeight = 1.4,
    padding = 2, // Reduced from 8 to 2 for much tighter margins
    color = '#2D1810',
    dpi = 2400, // Ultra high-quality DPI for embedded fonts (doubled for better printing)
    scale = 32,  // High scale for embedded font quality (doubled for better printing)
    backgroundColor = 'transparent' // Background color (default transparent for stories)
  } = options
  
  try {
    // Validate input dimensions and ensure they are integers
    const intWidth = Math.round(width)
    const intHeight = Math.round(height)
    
    if (!intWidth || !intHeight || intWidth <= 0 || intHeight <= 0) {
      throw new Error(`Invalid dimensions: width=${intWidth}, height=${intHeight}`)
    }
    
    // Calculate dimensions
    const maxWidth = intWidth - (padding * 2)
    const maxHeight = intHeight - (padding * 2)
    
    // Auto-adjust font size to fit
    const { lines, fontSize, wasTruncated } = autoSizeText(text, maxWidth, maxHeight, startFontSize, lineHeight)
    
    // Create ultra high-resolution image for 600 DPI
    const scaledWidth = intWidth * scale
    const scaledHeight = intHeight * scale
    const scaledFontSize = fontSize * scale
    const scaledPadding = padding * scale
    
    // Create SVG with embedded font for optimal quality
    const fontFamily = embeddedFont ? 'EB Garamond' : 'EB Garamond, Times New Roman, serif'
    const fontImport = embeddedFont ? '' : '@import url("https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,400&amp;display=swap");'
    
    const svgContent = `<svg width="${scaledWidth}" height="${scaledHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          ${fontImport}
          .text { 
            font-family: ${fontFamily}; 
            font-style: italic;
            fill: ${color}; 
            text-rendering: geometricPrecision;
            font-feature-settings: "liga" 1, "kern" 1;
            font-smooth: never;
            -webkit-font-smoothing: none;
            shape-rendering: crispEdges;
            font-display: block;
          }
        </style>
        ${backgroundColor !== 'transparent' ? `
        <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.8">
          <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:0.5" />
          <stop offset="70%" style="stop-color:${backgroundColor};stop-opacity:0.5" />
          <stop offset="100%" style="stop-color:${backgroundColor};stop-opacity:0.2" />
        </radialGradient>
        ` : ''}
      </defs>
      ${backgroundColor !== 'transparent' ? 
        `<rect width="${scaledWidth}" height="${scaledHeight}" fill="url(#vignette)" rx="${scaledPadding * 2}" ry="${scaledPadding * 2}" stroke="#E5E5E5" stroke-width="1"/>` :
        `<rect width="${scaledWidth}" height="${scaledHeight}" fill="${backgroundColor}"/>`
      }
      ${(() => {
        // Calculate total text height
        const totalTextHeight = lines.length * scaledFontSize * lineHeight
        // Calculate starting Y position to center the text block
        const startY = scaledPadding + (scaledHeight - (scaledPadding * 2) - totalTextHeight) / 2 + scaledFontSize
        
        return lines.map((line, i) => {
          const y = startY + (i * scaledFontSize * lineHeight)
          const escapedLine = escapeXml(line)
          return `<text x="${scaledWidth / 2}" y="${y}" class="text" font-size="${scaledFontSize}" font-weight="400" font-style="italic" text-anchor="middle">${escapedLine}</text>`
        }).join('')
      })()}
    </svg>`
    
    // Create the image with optimized settings for web fonts
    const buffer = await sharp(Buffer.from(svgContent))
      .resize(Math.round(width), Math.round(height), { 
        kernel: 'mitchell',
        fit: 'fill'
      })
      .png()
      .withMetadata({ density: dpi }) // Set DPI metadata for high-quality printing
      .toBuffer()
    
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
 * @returns {Promise<Object>} - Object with buffer, width, and height
 */
export async function createCaptionImage(captionText, maxWidth, maxHeight, options = {}) {
  const {
    startFontSize = 12, // Smaller font for captions
    lineHeight = 1.3,   // Tighter line height for captions
    padding = 8,         // Slightly more padding for captions with background
    color = '#2D1810',
    dpi = 2400,         // Ultra high-quality DPI (doubled for better printing)
    scale = 32,         // High scale for embedded font quality (doubled for better printing)
    backgroundColor = '#FFFFFF' // White background for captions
  } = options
  
  const buffer = await renderTextToImage(captionText, maxWidth, maxHeight, {
    startFontSize,
    lineHeight,
    padding,
    color,
    dpi,
    scale,
    backgroundColor // Pass the white background option
  })
  
  // Return object with buffer, width, and height
  return {
    buffer,
    width: maxWidth,
    height: maxHeight
  }
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