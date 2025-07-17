import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  try {
    console.log('🗜️ Compression endpoint called')
    const formData = await readFormData(event)
    const file = formData.get('file')
    const maxSizeMB = parseInt(formData.get('maxSizeMB') || '5')
    
    console.log(`🗜️ File received: ${file ? file.name : 'No file'}, maxSizeMB: ${maxSizeMB}`)
    
    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided'
      })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Get original image info
    const originalInfo = await sharp(buffer).metadata()
    
    // Check if compression is needed
    const originalSizeMB = buffer.length / (1024 * 1024)
    console.log(`🗜️ Original size: ${originalSizeMB.toFixed(2)}MB, threshold: ${maxSizeMB}MB`)
    
    if (originalSizeMB <= maxSizeMB) {
      console.log('🗜️ No compression needed')
      return {
        compressed: false,
        originalSize: buffer.length,
        compressedSize: buffer.length,
        originalBuffer: buffer
      }
    }
    
    console.log('🗜️ Compression needed, starting compression...')

    // Calculate new dimensions while maintaining aspect ratio
    const maxDimension = 1920
    let { width, height } = originalInfo
    
    if (width > height && width > maxDimension) {
      height = Math.round((height * maxDimension) / width)
      width = maxDimension
    } else if (height > maxDimension) {
      width = Math.round((width * maxDimension) / height)
      height = maxDimension
    }

    // Start with high quality and reduce if needed
    let quality = 80
    let compressedBuffer = null
    
    while (quality >= 10) {
      compressedBuffer = await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality,
          progressive: true,
          mozjpeg: true
        })
        .withMetadata() // Preserve EXIF data including GPS coordinates
        .toBuffer()
      
      const compressedSizeMB = compressedBuffer.length / (1024 * 1024)
      
      if (compressedSizeMB <= maxSizeMB) {
        break
      }
      
      quality -= 10
    }

    const compressedSizeMB = compressedBuffer.length / (1024 * 1024)
    console.log(`🗜️ Compression complete: ${originalSizeMB.toFixed(2)}MB -> ${compressedSizeMB.toFixed(2)}MB (quality: ${quality})`)
    
    return {
      compressed: true,
      originalSize: buffer.length,
      compressedSize: compressedBuffer.length,
      originalWidth: originalInfo.width,
      originalHeight: originalInfo.height,
      compressedWidth: width,
      compressedHeight: height,
      quality,
      compressedBuffer: compressedBuffer.toString('base64')
    }

  } catch (error) {
    console.error('Image compression error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to compress image'
    })
  }
}) 