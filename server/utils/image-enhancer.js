import sharp from 'sharp'

/**
 * Auto-enhance a photo using Sharp.
 * Applies brightness/saturation boost, sharpness, and histogram normalization.
 *
 * @param {string | Buffer} input - Path to image or Buffer
 * @param {Object} [options]
 * @param {string} [options.outputPath] - If provided, saves to this file. Otherwise returns Buffer.
 * @param {Object} [options.modulate] - Override default modulate settings
 * @returns {Promise<Buffer|void>} - Buffer if no outputPath, otherwise void
 */
export async function enhanceImage(input, options = {}) {
  const {
    outputPath,
    modulate = {
      brightness: 1.05,
      saturation: 1.15,
      hue: 0
    }
  } = options

  let image = sharp(input)

  image = image
    .modulate(modulate)      // Adjust brightness, saturation
    .sharpen()               // Apply unsharp mask
    .normalize()             // Stretch histogram (limited)
    .withMetadata()          // Preserve EXIF, ICC

  if (outputPath) {
    await image.toFile(outputPath)
    return
  } else {
    return await image.toBuffer()
  }
} 