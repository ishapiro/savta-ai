// Update Magic Memory Book endpoint
// Updates an existing row in memory_books for recreation

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Get user from auth token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }

    const body = await readBody(event)
    console.log('🔍 [update-magic-memory] Request body photos_to_replace:', body.photos_to_replace)
    const { 
      book_id, 
      asset_ids, 
      photo_selection_pool, 
      story, 
      title, 
      background_type = 'white', 
      background_color, 
      photo_count = 4, 
      theme_id, 
      output = 'PDF', 
      print_size = '8.5x11', 
      photo_selection_method,
      photo_selection_date_range,
      photo_selection_tags,
      photo_selection_location,
      photos_to_replace,
      ui = 'wizard'
    } = body
    
    if (!book_id) {
      throw createError({ statusCode: 400, statusMessage: 'book_id is required' })
    }
    
    // Check if this is a template creation (no story or assets yet)
    const isTemplate = !story || story.trim() === '' || !asset_ids || !Array.isArray(asset_ids) || asset_ids.length === 0
    
    // For photo replacement, we want to continue with generation, so set status to draft
    const isPhotoReplacement = photos_to_replace && Array.isArray(photos_to_replace) && photos_to_replace.length > 0
    
    // For non-template creation, validate required fields
    if (!isTemplate) {
      if (!asset_ids || !Array.isArray(asset_ids) || asset_ids.length < 1 || asset_ids.length > 6 || !story) {
        throw createError({ statusCode: 400, statusMessage: '1-6 asset_ids and story are required' })
      }
    }

    // For recreation mode, we need to fetch the current book to get the original data
    let previouslyUsedAssets = null
    let originalPhotoSelectionPool = null
    let originalCreatedFromAssets = null
    
    // Check if this is a recreation (either photo replacement or keep same photos)
    const isRecreation = (photos_to_replace && Array.isArray(photos_to_replace) && photos_to_replace.length > 0) || 
                        (photo_selection_method === 'keep_same')
    
    if (isRecreation) {
      // This is a recreation - fetch the current book to get the original data
      const { data: currentBook, error: fetchError } = await supabase
        .from('memory_books')
        .select('created_from_assets, photo_selection_pool')
        .eq('id', book_id)
        .eq('user_id', user.id)
        .single()
      
      if (fetchError) {
        console.error('❌ Error fetching current book for recreation:', fetchError)
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch current book for recreation' })
      }
      
      // Store the original created_from_assets as previously_used_assets (for photo replacement)
      if (photos_to_replace && Array.isArray(photos_to_replace) && photos_to_replace.length > 0) {
        if (currentBook.created_from_assets && Array.isArray(currentBook.created_from_assets) && currentBook.created_from_assets.length > 0) {
          previouslyUsedAssets = currentBook.created_from_assets
          console.log('🔄 [update-magic-memory] Storing original assets for photo replacement:', previouslyUsedAssets)
        }
      }
      
      // For "keep same photos" OR "replace selected" with no photos selected, preserve the original created_from_assets
      const shouldKeepSamePhotos = photo_selection_method === 'keep_same' || 
                                   (photo_selection_method === 'replace_selected' && (!photos_to_replace || !Array.isArray(photos_to_replace) || photos_to_replace.length === 0))
      
      if (shouldKeepSamePhotos) {
        if (currentBook.created_from_assets && Array.isArray(currentBook.created_from_assets) && currentBook.created_from_assets.length > 0) {
          originalCreatedFromAssets = currentBook.created_from_assets
          console.log('🔄 [update-magic-memory] Keeping same photos - preserving original created_from_assets:', originalCreatedFromAssets)
        }
      }
      
      // Preserve the original photo_selection_pool (the larger pool of available photos)
      if (currentBook.photo_selection_pool && Array.isArray(currentBook.photo_selection_pool) && currentBook.photo_selection_pool.length > 0) {
        originalPhotoSelectionPool = currentBook.photo_selection_pool
        console.log('🔄 [update-magic-memory] Preserving original photo selection pool:', originalPhotoSelectionPool)
      }
    }

    // Determine grid layout based on photo count
    let gridLayout = '2x2' // default for 4 photos
    if (photo_count === 2) {
      gridLayout = '2x1'
    } else if (photo_count === 3) {
      gridLayout = '2x2' // 2x2 with one empty space
    } else if (photo_count === 4) {
      gridLayout = '2x2'
    } else if (photo_count === 5) {
      gridLayout = '3x2' // 3x2 with one empty space
    } else if (photo_count === 6) {
      gridLayout = '3x2'
    }

    // Determine layout type based on whether a theme is selected
    const layoutType = theme_id ? 'theme' : 'grid'
    
    // Determine format based on UI: wizard creates cards, dialog creates books
    const format = ui === 'wizard' ? 'card' : 'book'
    
    // Prepare update data
    const updateData = {
      ai_supplemental_prompt: title || 'Select Photos That Tell a Story',
      layout_type: layoutType,
      ui: ui,
      format: format,
      created_from_assets: isTemplate ? null : (originalCreatedFromAssets || asset_ids),
      photo_selection_pool: photo_selection_pool || (isTemplate ? null : asset_ids),
      magic_story: isTemplate ? null : story,
      background_type: background_type,
      background_color: background_color,
      theme_id: theme_id || null,
      status: (isTemplate && !isPhotoReplacement) ? 'template' : 'draft',
      grid_layout: gridLayout,
      print_size: print_size,
      include_captions: true,
      include_tags: true,
      memory_shape: 'original',
      output: output,
      photo_selection_method: photo_selection_method || null,
      photos_to_replace: photos_to_replace ? JSON.stringify(photos_to_replace) : null,
      updated_at: new Date().toISOString()
    }

    // For photo replacement, keep same photos, or replace selected with no photos, clear the old PDF and background URLs to force regeneration
    const shouldClearPdfUrls = isPhotoReplacement || photo_selection_method === 'keep_same' || 
                               (photo_selection_method === 'replace_selected' && (!photos_to_replace || !Array.isArray(photos_to_replace) || photos_to_replace.length === 0))
    
    if (shouldClearPdfUrls) {
      updateData.pdf_url = null
      updateData.background_url = null
      console.log('🔄 [update-magic-memory] Clearing old PDF and background URLs for regeneration')
    }

    // If this is a recreation, preserve the original data
    if (previouslyUsedAssets) {
      updateData.previously_used_assets = previouslyUsedAssets
      console.log('🔄 [update-magic-memory] Adding previously_used_assets to update:', previouslyUsedAssets)
    }
    
    // For recreation, use the original photo selection pool instead of the new one
    if (originalPhotoSelectionPool) {
      updateData.photo_selection_pool = originalPhotoSelectionPool
      console.log('🔄 [update-magic-memory] Using original photo selection pool for recreation:', originalPhotoSelectionPool)
    }

    // Update existing memory book
    const { data, error } = await supabase
      .from('memory_books')
      .update(updateData)
      .eq('id', book_id)
      .eq('user_id', user.id) // Ensure user owns the book
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: 'Memory book not found or access denied' })
    }

    console.log('🔍 [update-magic-memory] Database update successful, stored photos_to_replace:', data.photos_to_replace)

    return {
      success: true,
      book_id: data.id
    }
  } catch (error) {
    console.error('Update Magic Memory error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update Magic Memory'
    })
  }
})
