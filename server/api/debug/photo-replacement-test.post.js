// Debug endpoint for testing photo replacement functionality
// This helps isolate the issue by testing components individually

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const { memoryBookId, userId, testType = 'full' } = body
    
    console.log('🧪 DEBUG - Photo replacement test started')
    console.log('🧪 DEBUG - Test type:', testType)
    console.log('🧪 DEBUG - Memory book ID:', memoryBookId)
    console.log('🧪 DEBUG - User ID:', userId)
    console.log('🧪 DEBUG - Environment:', process.env.NODE_ENV)
    console.log('🧪 DEBUG - Timestamp:', new Date().toISOString())
    
    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Test 1: Database connectivity
    console.log('🧪 DEBUG - Testing database connectivity...')
    const { data: testData, error: testError } = await supabase
      .from('memory_books')
      .select('id')
      .limit(1)
    
    if (testError) {
      throw new Error(`Database test failed: ${testError.message}`)
    }
    console.log('✅ Database connectivity test passed')
    
    // Test 2: Fetch memory book data
    console.log('🧪 DEBUG - Fetching memory book data...')
    const { data: memoryBook, error: bookError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', memoryBookId)
      .eq('user_id', userId)
      .single()
    
    if (bookError || !memoryBook) {
      throw new Error(`Memory book fetch failed: ${bookError?.message || 'Not found'}`)
    }
    console.log('✅ Memory book data fetched successfully')
    
    // Test 3: Parse photos to replace
    console.log('🧪 DEBUG - Parsing photos to replace...')
    const photosToReplace = memoryBook.photos_to_replace ? JSON.parse(memoryBook.photos_to_replace) : []
    console.log('🧪 DEBUG - Photos to replace:', photosToReplace)
    
    // Test 4: Fetch assets
    console.log('🧪 DEBUG - Fetching assets from photo selection pool...')
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', memoryBook.photo_selection_pool)
      .eq('user_id', userId)
      .eq('approved', true)
      .eq('deleted', false)
    
    if (assetsError || !assets || assets.length === 0) {
      throw new Error(`Assets fetch failed: ${assetsError?.message || 'No assets found'}`)
    }
    console.log('✅ Assets fetched successfully:', assets.length, 'assets')
    
    // Test 5: Calculate candidate assets
    console.log('🧪 DEBUG - Calculating candidate assets...')
    const usedOriginals = Array.isArray(memoryBook.created_from_assets) && memoryBook.created_from_assets.length > 0
      ? memoryBook.created_from_assets
      : (Array.isArray(memoryBook.previously_used_assets) ? memoryBook.previously_used_assets : [])
    
    const photosToKeep = usedOriginals.filter(id => !photosToReplace.includes(id))
    const candidateAssets = assets.filter(a => !photosToKeep.includes(a.id) && !photosToReplace.includes(a.id))
    
    console.log('🧪 DEBUG - Used originals:', usedOriginals.length)
    console.log('🧪 DEBUG - Photos to keep:', photosToKeep.length)
    console.log('🧪 DEBUG - Candidate assets:', candidateAssets.length)
    
    if (candidateAssets.length < photosToReplace.length) {
      throw new Error(`Not enough candidates: need ${photosToReplace.length}, have ${candidateAssets.length}`)
    }
    console.log('✅ Candidate assets calculation passed')
    
    // Test 6: OpenAI API configuration
    console.log('🧪 DEBUG - Testing OpenAI API configuration...')
    const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }
    console.log('✅ OpenAI API key is configured')
    
    // Test 7: Test OpenAI API call (if requested)
    if (testType === 'full') {
      console.log('🧪 DEBUG - Testing OpenAI API call...')
      const { selectPhotosByAttributes } = await import('~/server/utils/openai-client.js')
      
      const startTime = Date.now()
      const replacementSelectionResult = await selectPhotosByAttributes(
        candidateAssets,
        memoryBook.ai_supplemental_prompt,
        photosToReplace.length,
        []
      )
      const endTime = Date.now()
      
      console.log('✅ OpenAI API call completed in', endTime - startTime, 'ms')
      console.log('🧪 DEBUG - Selection result:', replacementSelectionResult)
    }
    
    return {
      success: true,
      data: {
        testType,
        memoryBook: {
          id: memoryBook.id,
          photo_selection_method: memoryBook.photo_selection_method,
          photos_to_replace: photosToReplace,
          created_from_assets: memoryBook.created_from_assets,
          previously_used_assets: memoryBook.previously_used_assets
        },
        assets: {
          total: assets.length,
          candidates: candidateAssets.length,
          usedOriginals: usedOriginals.length,
          photosToKeep: photosToKeep.length
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        }
      }
    }
    
  } catch (error) {
    console.error('🧪 DEBUG - Test failed:', error)
    return {
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    }
  }
})
