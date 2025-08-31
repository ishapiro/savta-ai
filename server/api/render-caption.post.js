import { renderTextToImage } from '~/server/utils/text-renderer.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { text, width, height, fontSize = 10, color = '#D16D84', backgroundColor = 'transparent' } = body

    if (!text || !width || !height) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: text, width, height'
      })
    }



    // Render the caption using the same high-quality text renderer as theme cards
    const imageBuffer = await renderTextToImage(text, width, height, {
      startFontSize: fontSize,
      lineHeight: 1.2, // Tighter line height for captions
      padding: 2, // Minimal padding for captions
      color: color,
      backgroundColor: backgroundColor,
      dpi: 1200, // Ultra high-quality DPI
      scale: 16 // High scale for embedded font quality
    })

    // Set response headers for image
    setHeader(event, 'Content-Type', 'image/jpeg')
    setHeader(event, 'Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    return imageBuffer

  } catch (error) {
    console.error('❌ Error rendering caption:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to render caption: ' + error.message
    })
  }
}) 