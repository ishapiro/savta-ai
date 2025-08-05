import { defineEventHandler, readBody, createError, setHeader } from 'h3'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { pdfBuffer, page = 1, quality = 100, dpi = 300, printSize = '7x5' } = body

    if (!pdfBuffer) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Missing PDF buffer' 
      })
    }

    console.log('🔄 Starting PDF to JPG conversion with system poppler...')
    console.log(`📄 Converting page ${page} at ${dpi} DPI with quality ${quality} for print size ${printSize}`)

    // Create temporary directory for conversion
    const tempId = uuid()
    const uploadDir = `/tmp/pdf-${tempId}`
    const inputPdfPath = path.join(uploadDir, 'input.pdf')
    const outputPath = path.join(uploadDir, 'output.jpg')

    // Ensure upload dir exists
    await fs.mkdir(uploadDir, { recursive: true })
    
    // Write PDF buffer to temporary file
    await fs.writeFile(inputPdfPath, Buffer.from(pdfBuffer))
    console.log('✅ PDF written to temporary file')

    // Convert PDF to JPEG using system pdftoppm with exact 300 DPI dimensions
    // Calculate dimensions based on print size at 300 DPI
    let targetWidth, targetHeight
    switch (printSize) {
      case '7x5':
        targetWidth = 2100  // 7 inches × 300 DPI
        targetHeight = 1500 // 5 inches × 300 DPI
        break
      case '8x10':
        targetWidth = 2400  // 8 inches × 300 DPI
        targetHeight = 3000 // 10 inches × 300 DPI
        break
      case '11x14':
        targetWidth = 3300  // 11 inches × 300 DPI
        targetHeight = 4200 // 14 inches × 300 DPI
        break
      case '12x12':
        targetWidth = 3600  // 12 inches × 300 DPI
        targetHeight = 3600 // 12 inches × 300 DPI
        break
      case 'a4':
        targetWidth = 2480  // A4 width at 300 DPI
        targetHeight = 3508 // A4 height at 300 DPI
        break
      default:
        targetWidth = 2100  // Default to 7x5
        targetHeight = 1500
    }
    
    const pdftoppmCommand = `pdftoppm -jpeg -f ${page} -l ${page} -x ${targetWidth} -y ${targetHeight} -singlefile "${inputPdfPath}" "${outputPath.replace('.jpg', '')}"`
    
    console.log('⚙️ pdftoppm command:', pdftoppmCommand)
    console.log(`📐 Target dimensions: ${targetWidth}x${targetHeight} pixels (${(targetWidth/300).toFixed(1)}x${(targetHeight/300).toFixed(1)} inches at 300 DPI for ${printSize} print size)`)
    
    try {
      await execAsync(pdftoppmCommand)
      console.log('✅ pdftoppm conversion completed')
    } catch (execError) {
      console.error('❌ pdftoppm conversion failed:', execError)
      throw new Error(`pdftoppm conversion failed: ${execError.message}`)
    }
    
    // Check if output file exists
    try {
      await fs.access(outputPath)
      console.log('✅ Generated JPEG file found')
    } catch (error) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Generated JPEG file not found' 
      })
    }

    // Process with Sharp for additional quality optimization
    console.log('🔄 Processing with Sharp for quality optimization...')
    const outputBuffer = await sharp(outputPath)
      .jpeg({ 
        quality: quality,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer()
    
    // Verify the output dimensions
    const imageInfo = await sharp(outputBuffer).metadata()
    console.log(`📊 Output image dimensions: ${imageInfo.width}x${imageInfo.height} pixels`)
    console.log(`📊 Expected dimensions: ${targetWidth}x${targetHeight} pixels`)
    
    if (imageInfo.width !== targetWidth || imageInfo.height !== targetHeight) {
      console.warn(`⚠️ Warning: Output dimensions (${imageInfo.width}x${imageInfo.height}) don't match expected (${targetWidth}x${targetHeight})`)
    }

    console.log(`✅ JPG conversion completed, size: ${outputBuffer.length} bytes`)

    // Clean up temp files
    try {
      await fs.rm(uploadDir, { recursive: true, force: true })
      console.log('🧹 Temporary files cleaned up')
    } catch (cleanupError) {
      console.warn('⚠️ Error cleaning up temporary files:', cleanupError.message)
    }

    // Set response headers
    setHeader(event, 'Content-Type', 'image/jpeg')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')

    return outputBuffer

  } catch (error) {
    console.error('❌ PDF to JPG conversion failed:', error)
    
    // Clean up temp files on error
    try {
      const tempId = uuid()
      const uploadDir = `/tmp/pdf-${tempId}`
      await fs.rm(uploadDir, { recursive: true, force: true })
    } catch (cleanupError) {
      console.warn('⚠️ Error cleaning up temporary files on error:', cleanupError.message)
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to convert PDF to JPG: ' + error.message
    })
  }
}) 