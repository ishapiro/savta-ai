// Magic Memory AI endpoint
// Includes the photo selection and story generation in two separate AI calls
// Receives photo metadata, selects photos, and generates a story in two separate AI calls

export default defineEventHandler(async (event) => {
  try {
    console.log('🎭 Magic Memory AI endpoint called - starting new story generation')
    const config = useRuntimeConfig()
    const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      throw createError({ statusCode: 500, statusMessage: 'OpenAI API key not configured' })
    }

    const body = await readBody(event)
    let { photos, forceAll = false, title, memory_event, photo_count = 4, background_type = 'white', background_color, theme_id } = body // Array of { id, ai_caption, people_detected, tags, user_tags }, and forceAll boolean, plus memory book fields
    if (!photos || !Array.isArray(photos) || photos.length < 1) {
      throw createError({ statusCode: 400, statusMessage: 'At least 1 photo is required' })
    }

    console.log(`🎭 Magic Memory AI - Input: ${photos.length} photos, title: "${title}", photo_count: ${photo_count}, theme_id: ${theme_id}`)

    // Determine target photo count based on theme if provided
    let targetPhotoCount = photo_count
    if (theme_id) {
      try {
        console.log(`🎨 Theme selected (${theme_id}), fetching theme information...`)
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          config.public.supabaseUrl,
          config.supabaseServiceRoleKey || config.public.supabaseKey
        )
        
        const { data: theme, error: themeError } = await supabase
          .from('themes')
          .select('layout_config')
          .eq('id', theme_id)
          .eq('deleted', false)
          .single()
        
        if (themeError || !theme) {
          console.warn(`⚠️ Theme not found (${theme_id}), using default photo count: ${photo_count}`)
        } else {
          try {
            const layoutConfig = typeof theme.layout_config === 'string' 
              ? JSON.parse(theme.layout_config) 
              : theme.layout_config
            
            if (layoutConfig && layoutConfig.photos && Array.isArray(layoutConfig.photos)) {
              targetPhotoCount = layoutConfig.photos.length
              console.log(`🎨 Theme photo count: ${targetPhotoCount} photos`)
            } else {
              console.warn(`⚠️ Theme layout_config invalid, using default photo count: ${photo_count}`)
            }
          } catch (parseError) {
            console.warn(`⚠️ Error parsing theme layout_config, using default photo count: ${photo_count}`)
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error fetching theme, using default photo count: ${photo_count}`)
      }
    }

    // Validate photo_count - only apply validation if no theme is selected
    if (!theme_id) {
      const validPhotoCounts = [1, 4, 6]
      targetPhotoCount = validPhotoCounts.includes(targetPhotoCount) ? targetPhotoCount : 4
    }

    // Build memory book context string
    let memoryBookContext = ''
    if (title && title.trim()) {
      memoryBookContext += `User selection prompt: "${title.trim()}"\n`
    }
    if (memory_event && memory_event.trim()) {
      memoryBookContext += `Event: ${memory_event.trim()}\n`
    }

    // Calculate prompt length and limit photos if necessary
    const maxPromptLength = 10000
    let photosToInclude = photos
    let truncatedPhotoCount = 0
    
    // If too many photos, use intelligent photo selection based on character contribution
    if (photos.length > 20) { // Limit to 20 photos for selection
      console.log(`⚠️ Too many photos (${photos.length}), using intelligent photo selection...`)
      
      // Calculate character contribution for each photo
      const photoContributions = photos.map((p, index) => {
        const photoNumber = index + 1
        const paddedNumber = photoNumber.toString().padStart(3, '0')
        
        // Calculate the character contribution of this photo
        const photoSummary = `Photo ${paddedNumber}:
- orientation: ${p.orientation || 'unknown'}
- dimensions: ${p.width || 'unknown'}x${p.height || 'unknown'}
- ai_caption: ${p.ai_caption || ''}
- people_detected: ${(p.people_detected||[]).join(', ')}
- tags: ${(p.tags||[]).join(', ')}
- user_tags: ${(p.user_tags||[]).join(', ')}`
        
        // Add location information if available
        let locationInfo = ''
        
        // Use comprehensive location field if available (includes landmarks, neighborhoods, etc.)
        if (p.location && p.location.trim()) {
          locationInfo = `\n- location: ${p.location.trim()}`
        } else {
          // Fallback to individual location components
          const locationParts = []
          if (p.city && p.city.trim()) locationParts.push(p.city.trim())
          if (p.state && p.state.trim()) locationParts.push(p.state.trim())
          if (p.country && p.country.trim()) locationParts.push(p.country.trim())
          if (p.zip_code && p.zip_code.trim()) locationParts.push(p.zip_code.trim())
          
          if (locationParts.length > 0) {
            locationInfo = `\n- location: ${locationParts.join(', ')}`
          }
        }
        
        // Add date information if available
        let dateInfo = ''
        if (p.asset_date) {
          const photoDate = new Date(p.asset_date)
          const formattedDate = photoDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          dateInfo = `\n- date: ${formattedDate}`
        }
        if (p.created_at) {
          const uploadDate = new Date(p.created_at)
          const mm = String(uploadDate.getMonth() + 1).padStart(2, '0')
          const dd = String(uploadDate.getDate()).padStart(2, '0')
          const yyyy = uploadDate.getFullYear()
          dateInfo += `\n- upload_date: ${mm}-${dd}-${yyyy}`
        }
        
        // Add fingerprint for duplicate detection
        let fingerprintInfo = ''
        if (p.fingerprint) {
          fingerprintInfo = `\n- fingerprint: ${p.fingerprint}`
        }
        
        const fullPhotoText = photoSummary + locationInfo + dateInfo + fingerprintInfo
        
        return {
          index,
          photo: p,
          photoText: fullPhotoText,
          characterCount: fullPhotoText.length
        }
      })
      
      // Sort by character count (most descriptive first) and take top 20
      photoContributions.sort((a, b) => b.characterCount - a.characterCount)
      const selectedPhotos = photoContributions.slice(0, 20)
      
      // Sort selected photos back to original order
      selectedPhotos.sort((a, b) => a.index - b.index)
      
      photosToInclude = selectedPhotos.map(c => c.photo)
      truncatedPhotoCount = photos.length - selectedPhotos.length
      
      console.log(`📊 Intelligent photo selection: ${selectedPhotos.length} photos selected (${truncatedPhotoCount} removed)`)
    }
    
    // Update the photos array to use the limited set
    photos = photosToInclude

    // STEP 1: PHOTO SELECTION
    console.log(`📝 Photo selection prompt: ${targetPhotoCount} photos, ${photos.length} available, forceAll: ${forceAll}`)
    
    // If forceAll is true, skip AI photo selection and use all photos
    if (forceAll) {
      console.log('📚 ForceAll mode: Using all provided photos without AI selection')
      const selectedPhotos = photos
      console.log('✨ Photo selection completed (forceAll mode)')
      console.log('Selected photo IDs:', selectedPhotos.map(p => p.id))
      
      // Skip to story generation with all photos
      const selectedPhotoIds = selectedPhotos.map(p => p.id)
      
      // STEP 2: STORY GENERATION (using all photos)
      console.log('📖 Generating story for all selected photos...')
      
      // Generate story for all photos
      const selectedPhotoSummaries = selectedPhotos.map((p, i) => {
        const photoNumber = i + 1
        const paddedNumber = photoNumber.toString().padStart(3, '0')
        let summary = `Photo ${paddedNumber}:\n- orientation: ${p.orientation || 'unknown'}\n- dimensions: ${p.width || 'unknown'}x${p.height || 'unknown'}\n- ai_caption: ${p.ai_caption || ''}\n- people_detected: ${(p.people_detected||[]).join(', ')}\n- tags: ${(p.tags||[]).join(', ')}\n- user_tags: ${(p.user_tags||[]).join(', ')}`
        
        // Add fingerprint for duplicate detection
        if (p.fingerprint) {
          summary += `\n- fingerprint: ${p.fingerprint}`
        }
        
        // Add location information if available
        if (p.location && p.location.trim()) {
          summary += `\n- location: ${p.location.trim()}`
        } else {
          const locationParts = []
          if (p.city && p.city.trim()) locationParts.push(p.city.trim())
          if (p.state && p.state.trim()) locationParts.push(p.state.trim())
          if (p.country && p.country.trim()) locationParts.push(p.country.trim())
          if (p.zip_code && p.zip_code.trim()) locationParts.push(p.zip_code.trim())
          
          if (locationParts.length > 0) {
            summary += `\n- location: ${locationParts.join(', ')}`
          }
        }
        
        // Add date information if available
        if (p.asset_date) {
          const photoDate = new Date(p.asset_date)
          const formattedDate = photoDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          summary += `\n- date: ${formattedDate}`
        }
        if (p.created_at) {
          const uploadDate = new Date(p.created_at)
          const mm = String(uploadDate.getMonth() + 1).padStart(2, '0')
          const dd = String(uploadDate.getDate()).padStart(2, '0')
          const yyyy = uploadDate.getFullYear()
          summary += `\n- upload_date: ${mm}-${dd}-${yyyy}`
        }
        
        return summary
      }).join('\n\n')
      
      // Generate story for all photos
      const storySystemInstructions = `You are a warm, pithy, witty, hip and playful, grandmother 
      creating personalized caption for this group of photos.  Highlight the most important moments and relationships
      mentioned in the photo captions, tags, and people detected.

      TASK: Create a 1-2 sentence caption that connects the selected photos into a cohesive narrative.
      
      RESTRICTIONS:
      - Keep the story PG.
      - Do not say "young ones" or "youngsters" — use "kids" or "children" instead.
      - Do not invent or guess any place names, cities, states, countries, zip codes, landmarks, or personal names.
      - You may only reference a location (including landmarks, neighborhoods, cities, states, or countries) if every photo in the list has the exact same location in the metadata.
      - If even one photo is missing a location, or has a different location, do not mention any location at all.
      - Only use names of people that are explicitly found in the photo metadata or the user selection prompt.
      - Never fabricate or infer people names from context.
      - When location data is available and consistent across all photos, you may mention landmarks, neighborhoods, or distinctive places that add context to the story.
      
      STYLE REQUIREMENTS:
      - Warm, fun, and lighthearted tone like a hip grandma.
      - But not too sappy or corny.
      - 8th grade reading level.
      - Natural, personal, and delightful language.
      - Use photo context (captions, tags, people) for richness, but don't mention them literally.
      - IMPORTANT: Only use letters and symbols from the Latin character set (no Hebrew, Cyrillic, or other scripts). All output must be in English and use only Latin characters.
      
      ${memoryBookContext}
      STORY GUIDELINES:
      - Weave together the selected photos into a single cohesive caption.
      - Focus on relationships, emotions, and shared experiences.
      - Make it feel like a personal family memory.
      - Use 1–2 sentences maximum.`;

      const storyPrompt = `${storySystemInstructions}

SELECTED PHOTOS FOR STORY (${selectedPhotos.length} photos):
${selectedPhotoSummaries}

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact field:
{
  "story": "Your 1-2 sentence story here..."
}`

      // Call OpenAI for story generation
      console.log('🤖 Making AI call for story generation (forceAll mode)...')
      const storyRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-5',
          messages: [
            { role: 'system', content: 'You are a warm, caring grandmother creating personalized stories.' },
            { role: 'user', content: storyPrompt }
          ],
          max_completion_tokens: 5000
        })
      })

      if (!storyRes.ok) {
        const errorText = await storyRes.text()
        throw createError({ statusCode: 500, statusMessage: `OpenAI API error: ${errorText}` })
      }

      const storyData = await storyRes.json()
      const storyText = storyData.choices[0].message.content

      console.log(`🤖 Story generation response received (${storyText.length} chars)`)

      // Parse story JSON
      let storyResult
      try {
        const jsonMatch = storyText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          storyResult = JSON.parse(jsonMatch[0])
          console.log(`✅ Parsed story generation: ${storyResult.story ? 'Story generated' : 'No story'}`)
        } else {
          throw new Error('No JSON found in story response')
        }
      } catch (err) {
        console.error('Story generation JSON parsing error:', err)
        console.error('Raw story response:', storyText)
        
        // Fallback: use a simple story
        storyResult = {
          story: `A beautiful collection of ${selectedPhotos.length} special moments.`
        }
        console.log('Fallback story result:', storyResult)
      }

      // Return the result with all photo IDs
      return {
        story: storyResult.story || `A beautiful collection of ${selectedPhotos.length} special moments.`,
        selected_photo_ids: selectedPhotoIds
      }
    }
    
    const photoSummaries = photos.map((p, i) => {
      const photoNumber = i + 1
      const paddedNumber = photoNumber.toString().padStart(3, '0') // 001, 012, 123, etc.
      let summary = `Photo ${paddedNumber}:\n- orientation: ${p.orientation || 'unknown'}\n- dimensions: ${p.width || 'unknown'}x${p.height || 'unknown'}\n- ai_caption: ${p.ai_caption || ''}\n- people_detected: ${(p.people_detected||[]).join(', ')}\n- tags: ${(p.tags||[]).join(', ')}\n- user_tags: ${(p.user_tags||[]).join(', ')}`
      
      // Add fingerprint for duplicate detection
      if (p.fingerprint) {
        summary += `\n- fingerprint: ${p.fingerprint}`
      }
      
      // Add location information if available
      if (p.location && p.location.trim()) {
        // Use comprehensive location field (includes landmarks, neighborhoods, etc.)
        summary += `\n- location: ${p.location.trim()}`
      } else {
        // Fallback to individual location components
        const locationParts = []
        if (p.city && p.city.trim()) locationParts.push(p.city.trim())
        if (p.state && p.state.trim()) locationParts.push(p.state.trim())
        if (p.country && p.country.trim()) locationParts.push(p.country.trim())
        if (p.zip_code && p.zip_code.trim()) locationParts.push(p.zip_code.trim())
        
        if (locationParts.length > 0) {
          summary += `\n- location: ${locationParts.join(', ')}`
        }
      }
      
      // Add date information if available
      if (p.asset_date) {
        const photoDate = new Date(p.asset_date)
        const formattedDate = photoDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        summary += `\n- date: ${formattedDate}`
      }
      // Add upload_date (created_at) in MM-DD-YYYY format if available
      if (p.created_at) {
        const uploadDate = new Date(p.created_at)
        const mm = String(uploadDate.getMonth() + 1).padStart(2, '0')
        const dd = String(uploadDate.getDate()).padStart(2, '0')
        const yyyy = uploadDate.getFullYear()
        summary += `\n- upload_date: ${mm}-${dd}-${yyyy}`
      }
      
      return summary
    }).join('\n\n')

    // PHOTO SELECTION PROMPT -- AI PROMPT

    const selectionSystemInstructions = `You are a warm, caring grandmother selecting the most 
    meaningful family photos for a memory book.

TASK: Select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} from the provided photo pool 
that will create the best story together.  Prioritize photos that are related to the user selection prompt or event.

${memoryBookContext}
PHOTO SELECTION RULES:
- You MUST select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} from the provided pool
- If there is a location named in the user selection prompt, match it against the location data in photo metadata (including landmarks, neighborhoods, cities, states, countries)
- Prioritize photos with a recent photo date
- Select photos that are related to the user selection prompt or event
- Choose the most meaningful and emotionally connected photos that work well together
- Consider relationships, themes, and storytelling potential when selecting
- If dates are available, use them to create a chronological or thematic flow
- Pay attention to landmarks and distinctive locations that add context to the story
- Arrange selected photos in the best storytelling order
- CRITICAL: Use the photo numbers (1, 2, 3, etc.) exactly as shown in the "Photo X:" labels
- CRITICAL: Copy the photo numbers EXACTLY - do not modify, change, or generate new numbers
- CRITICAL: The photo numbers must match exactly with the provided pool
- CRITICAL: Do NOT select photos with the same fingerprint - each selected photo must have a unique fingerprint

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact field:
{
  "selected_photo_numbers": [1, 2, 3, 4]
}

EXAMPLE:
If you want to select photos 1, 2, 3, and 4 from the pool, your response should look like this EXACT format:
{
  "selected_photo_numbers": [1, 2, 3, 4]
}

IMPORTANT: 
- Only include photo numbers that exist in the provided pool (1 to ${photos.length})
- Select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''}, no more, no less
- Use plain photo numbers (1, 2, 3, etc.) without leading zeros - NOT 001, 002, 003
- Photo numbers correspond to the "Photo X:" entries above (ignore the zero-padding in labels)`

    const photoDataSection = `PHOTO SELECTION POOL (${photos.length} photos available):
${photoSummaries}

SELECTION INSTRUCTIONS:
${forceAll ? 
  `Use ALL ${photos.length} provided photos in the order given as the selection pool.` : 
  `From the ${photos.length} photos above, select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} that will create the best story together. Choose photos that are meaningful and emotionally connected.`
}`

    const selectionPrompt = `${selectionSystemInstructions}

${photoDataSection}`

    // Call OpenAI for photo selection
    console.log('🤖 Making first AI call for photo selection...')
    console.log("*** Photo selection prompt ***")
    console.log(selectionPrompt)
    console.log("*** Photo selection prompt ***")
    
    const selectionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: 'You are a warm, caring grandmother selecting meaningful family photos.' },
          { role: 'user', content: selectionPrompt }
        ],
        max_completion_tokens: 10000
      })
    })

    if (!selectionRes.ok) {
      const errorText = await selectionRes.text()
      throw createError({ statusCode: 500, statusMessage: `OpenAI API error: ${errorText}` })
    }

    const selectionData = await selectionRes.json()
    const selectionText = selectionData.choices[0].message.content

    console.log(`🤖 Photo selection response received (${selectionText.length} chars)`)

    // Parse photo selection JSON
    let selectionResult
    try {
      const jsonMatch = selectionText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonText = jsonMatch[0]
        
        // Clean up leading zeros in photo numbers before parsing
        const cleanedJsonText = jsonText.replace(/"selected_photo_numbers":\s*\[([^\]]+)\]/g, (match, numbers) => {
          const cleanedNumbers = numbers.split(',').map(num => {
            const trimmed = num.trim()
            // Remove leading zeros but keep the number
            return parseInt(trimmed, 10).toString()
          }).join(', ')
          return `"selected_photo_numbers": [${cleanedNumbers}]`
        })
        
        selectionResult = JSON.parse(cleanedJsonText)
        console.log(`✅ Parsed photo selection: ${selectionResult.selected_photo_numbers?.length || 0} photos selected`)
      } else {
        throw new Error('No JSON found in selection response')
      }
    } catch (err) {
      console.error('Photo selection JSON parsing error:', err)
      console.error('Raw selection response:', selectionText)
      
      // Fallback: use first N photos in order
      console.log('⚠️ Photo selection failed, using fallback')
      const fallbackResult = {
        selected_photo_numbers: Array.from({ length: Math.min(targetPhotoCount, photos.length) }, (_, i) => i + 1)
      }
      selectionResult = fallbackResult
      console.log('Fallback selection result:', selectionResult)
    }

    if (!selectionResult.selected_photo_numbers) {
      throw createError({ statusCode: 500, statusMessage: 'Photo selection response missing required fields' })
    }

    // Validate that selected photo numbers exist in the provided pool
    const availablePhotoNumbers = Array.from({ length: photos.length }, (_, i) => i + 1)
    const invalidPhotoNumbers = selectionResult.selected_photo_numbers.filter(num => !availablePhotoNumbers.includes(num))
    
    console.log("****************************")
    console.log("Photo selection validation")
    console.log("****************************")
    console.log(`Target photo count: ${targetPhotoCount}`)
    console.log(`AI selected count: ${selectionResult.selected_photo_numbers.length}`)
    console.log(`AI selected numbers: ${selectionResult.selected_photo_numbers}`)
    console.log(`Available numbers: ${availablePhotoNumbers}`)
    console.log(`Invalid numbers: ${invalidPhotoNumbers}`)
    console.log("****************************")
    
    if (invalidPhotoNumbers.length > 0) {
      console.error('AI selected invalid photo numbers:', invalidPhotoNumbers)
      console.error('Available photo numbers:', availablePhotoNumbers)
      
      // Filter out invalid numbers and keep only valid ones
      const validPhotoNumbers = selectionResult.selected_photo_numbers.filter(num => availablePhotoNumbers.includes(num))
      
      console.log(`Valid photo numbers: ${validPhotoNumbers.length}/${targetPhotoCount}`)
      console.log(`Invalid numbers: ${invalidPhotoNumbers.length}`)
      
      if (validPhotoNumbers.length === 0) {
        throw createError({ statusCode: 500, statusMessage: `No valid photo numbers found. AI selected all invalid numbers: ${invalidPhotoNumbers.join(', ')}` })
      }
      
      if (validPhotoNumbers.length < targetPhotoCount) {
        console.warn(`⚠️ Only ${validPhotoNumbers.length} valid photos found, proceeding with fewer photos than requested (${targetPhotoCount})`)
      }
      
      // Use the valid numbers
      selectionResult.selected_photo_numbers = validPhotoNumbers
      console.log('Final valid photo numbers:', validPhotoNumbers)
    }

    // Convert photo numbers to actual selected photos
    const selectedPhotos = selectionResult.selected_photo_numbers.map(num => photos[num - 1])
    console.log('✨ Photo selection completed successfully')
    console.log('Selected photo IDs:', selectedPhotos.map(p => p.id))

    // Validate that we have at least some photos selected
    if (selectedPhotos.length < 1) {
      console.error(`AI selected ${selectedPhotos.length} photos, need at least 1`)
      throw createError({ statusCode: 500, statusMessage: `AI selected ${selectedPhotos.length} photos, need at least 1` })
    }
    
    // Warn if we have fewer photos than requested, but proceed
    if (selectedPhotos.length < targetPhotoCount) {
      console.warn(`⚠️ AI selected ${selectedPhotos.length} photos, requested ${targetPhotoCount}. Proceeding with available photos.`)
    }

    // STEP 2: STORY GENERATION (using only selected photos)
    console.log(`📝 Story generation prompt: ${selectedPhotos.length} selected photos`)
    
    const selectedPhotoSummaries = selectedPhotos.map((p, i) => {
      const photoNumber = i + 1
      const paddedNumber = photoNumber.toString().padStart(3, '0')
      let summary = `Photo ${paddedNumber}:\n- orientation: ${p.orientation || 'unknown'}\n- dimensions: ${p.width || 'unknown'}x${p.height || 'unknown'}\n- ai_caption: ${p.ai_caption || ''}\n- people_detected: ${(p.people_detected||[]).join(', ')}\n- tags: ${(p.tags||[]).join(', ')}\n- user_tags: ${(p.user_tags||[]).join(', ')}`
      
      // Add fingerprint for duplicate detection
      if (p.fingerprint) {
        summary += `\n- fingerprint: ${p.fingerprint}`
      }
      
      // Add location information if available
      if (p.location && p.location.trim()) {
        // Use comprehensive location field (includes landmarks, neighborhoods, etc.)
        summary += `\n- location: ${p.location.trim()}`
      } else {
        // Fallback to individual location components
        const locationParts = []
        if (p.city && p.city.trim()) locationParts.push(p.city.trim())
        if (p.state && p.state.trim()) locationParts.push(p.state.trim())
        if (p.country && p.country.trim()) locationParts.push(p.country.trim())
        if (p.zip_code && p.zip_code.trim()) locationParts.push(p.zip_code.trim())
        
        if (locationParts.length > 0) {
          summary += `\n- location: ${locationParts.join(', ')}`
        }
      }
      
      // Add date information if available
      if (p.asset_date) {
        const photoDate = new Date(p.asset_date)
        const formattedDate = photoDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        summary += `\n- date: ${formattedDate}`
      }
      // Add upload_date (created_at) in MM-DD-YYYY format if available
      if (p.created_at) {
        const uploadDate = new Date(p.created_at)
        const mm = String(uploadDate.getMonth() + 1).padStart(2, '0')
        const dd = String(uploadDate.getDate()).padStart(2, '0')
        const yyyy = uploadDate.getFullYear()
        summary += `\n- upload_date: ${mm}-${dd}-${yyyy}`
      }
      
      return summary
    }).join('\n\n')

    // STORY PROMPT -- AI PROMPT
    
    const storySystemInstructions = `You are a warm, pithy, witty, hip and playful, grandmother 
    creating personalized caption for this group of photos.  Highlight the most important moments and relationships
    mentioned in the photo captions, tags, and people detected.

    TASK: Create a 1-2 sentence caption that connects the selected photos into a cohesive narrative.
    
    RESTRICTIONS:
    - Keep the story PG.
    - Do not say "young ones" or "youngsters" — use "kids" or "children" instead.
    - Do not invent or guess any place names, cities, states, countries, zip codes, landmarks, or personal names.
    - You may only reference a location (including landmarks, neighborhoods, cities, states, or countries) if every photo in the list has the exact same location in the metadata.
    - If even one photo is missing a location, or has a different location, do not mention any location at all.
    - Only use names of people that are explicitly found in the photo metadata or the user selection prompt.
    - Never fabricate or infer people names from context.
    - When location data is available and consistent across all photos, you may mention landmarks, neighborhoods, or distinctive places that add context to the story.
    
    STYLE REQUIREMENTS:
    - Warm, fun, and lighthearted tone like a hip grandma.
    - But not too sappy or corny.
    - 8th grade reading level.
    - Natural, personal, and delightful language.
    - Use photo context (captions, tags, people) for richness, but don't mention them literally.
    - IMPORTANT: Only use letters and symbols from the Latin character set (no Hebrew, Cyrillic, or other scripts). All output must be in English and use only Latin characters.
    
    ${memoryBookContext}
    STORY GUIDELINES:
    - Weave together the selected photos into a single cohesive caption.
    - Focus on relationships, emotions, and shared experiences.
    - Make it feel like a personal family memory.
    - Use 1–2 sentences maximum.`;

    const storyPrompt = `${storySystemInstructions}

SELECTED PHOTOS FOR STORY (${selectedPhotos.length} photos):
${selectedPhotoSummaries}

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact field:
{
  "story": "Your 1-2 sentence story here..."
}

EXAMPLE:
{
  "story": "Your story here..."
}`

    // Log the full story prompt for debugging
    console.log('🤖 STORY GENERATION PROMPT DEBUG:')
    console.log('='.repeat(80))
    console.log(storyPrompt)
    console.log('='.repeat(80))

    // Call OpenAI for story generation
    console.log('🤖 Making second AI call for story generation...')
    const storyRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: 'You are a warm, witty Hallmark card writer.' },
          { role: 'user', content: storyPrompt }
        ],
        max_completion_tokens: 5000
      })
    })

    if (!storyRes.ok) {
      const errorText = await storyRes.text()
      throw createError({ statusCode: 500, statusMessage: `OpenAI API error: ${errorText}` })
    }

    const storyData = await storyRes.json()
    const storyText = storyData.choices[0].message.content

    console.log(`🤖 Story generation response received (${storyText.length} chars)`)

    // Parse story JSON
    let storyResult
    try {
      const jsonMatch = storyText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        storyResult = JSON.parse(jsonMatch[0])
        console.log(`✅ Parsed story generation`)
      } else {
        throw new Error('No JSON found in story response')
      }
    } catch (err) {
      console.error('Story generation JSON parsing error:', err)
      console.error('Raw story response:', storyText)
      
      // Fallback: use a simple story
      console.log('⚠️ Story generation failed, using fallback')
      const fallbackResult = {
        story: `A beautiful collection of family moments captured with love. Each photo tells its own story, and together they create a tapestry of memories that will be cherished for years to come.`
      }
      storyResult = fallbackResult
      console.log('Fallback story result:', storyResult)
    }

    if (!storyResult.story) {
      throw createError({ statusCode: 500, statusMessage: 'Story generation response missing required fields' })
    }

    // Convert selected photos to IDs for return
    const selectedPhotoIds = selectedPhotos.map(p => p.id)

    console.log('🎭 Magic Memory AI - Final Results:')
    console.log(`📸 Selected ${selectedPhotoIds.length} photos:`, selectedPhotoIds)
    console.log(`📖 Generated story: "${storyResult.story}"`)

    return {
      success: true,
      selected_photo_ids: selectedPhotoIds,
      story: storyResult.story,
      background_type: background_type,
      background_color: background_color
    }
  } catch (error) {
    console.error('Magic Memory AI error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate Magic Memory'
    })
  }
}) 