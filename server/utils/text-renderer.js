// Shared text rendering utility for memory books
// Handles high-resolution text rendering for both stories and captions

import sharp from 'sharp'

/**
 * Escape XML/SVG special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
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
  
  for (let attempt = 0; attempt < 5; attempt++) {
    lines = wrapText(text, maxWidth, fontSize)
    const totalHeight = lines.length * fontSize * lineHeight
    
    if (totalHeight <= maxHeight) {
      break // Font size fits
    } else {
      fontSize = Math.max(8, fontSize - 1) // Reduce font size
    }
  }
  
  return { lines, fontSize }
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
    padding = 8,
    color = '#2D1810',
    dpi = 300, // Print-quality DPI
    scale = 4   // Higher scale for 300 DPI rendering
  } = options
  
  try {
    console.log('🎨 Rendering high-quality text at 300 DPI with Sharp...')
    
    // Calculate dimensions
    const maxWidth = width - (padding * 2)
    const maxHeight = height - (padding * 2)
    
    // Auto-adjust font size to fit
    const { lines, fontSize } = autoSizeText(text, maxWidth, maxHeight, startFontSize, lineHeight)
    
    console.log(`📏 Auto-sized text: ${fontSize}px font, ${lines.length} lines`)
    
    // Create ultra high-resolution transparent background image for 300 DPI
    const scaledWidth = width * scale
    const scaledHeight = height * scale
    const scaledFontSize = fontSize * scale
    const scaledPadding = padding * scale
    
    const buffer = await sharp({
      create: {
        width: scaledWidth,
        height: scaledHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      {
        input: Buffer.from(`<svg width="${scaledWidth}" height="${scaledHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
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
            return `<text x="${scaledPadding}" y="${y}" class="text" font-size="${scaledFontSize}" font-weight="400">${escapedLine}</text>`
          }).join('')}
        </svg>`),
        blend: 'over'
      }
    ])
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