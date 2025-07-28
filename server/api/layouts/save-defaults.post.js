import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validate the body contains layouts
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      })
    }

    // Path to the default layouts JSON file
    const layoutsPath = join(process.cwd(), 'public', 'default-layouts.json')
    
    // Write the updated layouts back to the file
    await writeFile(layoutsPath, JSON.stringify(body, null, 2), 'utf8')
    
    console.log('[SAVE DEFAULTS] Successfully updated default layouts file')
    
    return {
      success: true,
      message: 'Default layouts updated successfully'
    }
  } catch (error) {
    console.error('[SAVE DEFAULTS] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save default layouts'
    })
  }
}) 