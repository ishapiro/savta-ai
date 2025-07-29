// Magic Memory AI endpoint
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
    let { photos, forceAll, title, memory_event, photo_count = 4, background_type = 'white', background_color } = body // Array of { id, ai_caption, people_detected, tags, user_tags }, and forceAll boolean, plus memory book fields
    if (!photos || !Array.isArray(photos) || photos.length < 1) {
      throw createError({ statusCode: 400, statusMessage: 'At least 1 photo is required' })
    }

    console.log(`🎭 Magic Memory AI - Input: ${photos.length} photos, title: "${title}", photo_count: ${photo_count}`)

    // Validate photo_count
    const validPhotoCounts = [1, 4, 6]
    const targetPhotoCount = validPhotoCounts.includes(photo_count) ? photo_count : 4

    // Build memory book context string
    let memoryBookContext = ''
    if (title && title.trim()) {
      memoryBookContext += `Title: "${title.trim()}"\n`
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
        const locationParts = []
        if (p.city && p.city.trim()) locationParts.push(p.city.trim())
        if (p.state && p.state.trim()) locationParts.push(p.state.trim())
        if (p.country && p.country.trim()) locationParts.push(p.country.trim())
        if (p.zip_code && p.zip_code.trim()) locationParts.push(p.zip_code.trim())
        
        if (locationParts.length > 0) {
          locationInfo = `\n- location: ${locationParts.join(', ')}`
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
    console.log(`📝 Photo selection prompt: ${targetPhotoCount} photos, ${photos.length} available`)
    
    const photoSummaries = photos.map((p, i) => {
      const photoNumber = i + 1
      const paddedNumber = photoNumber.toString().padStart(3, '0') // 001, 012, 123, etc.
      let summary = `Photo ${paddedNumber}:\n- orientation: ${p.orientation || 'unknown'}\n- dimensions: ${p.width || 'unknown'}x${p.height || 'unknown'}\n- ai_caption: ${p.ai_caption || ''}\n- people_detected: ${(p.people_detected||[]).join(', ')}\n- tags: ${(p.tags||[]).join(', ')}\n- user_tags: ${(p.user_tags||[]).join(', ')}`
      
      // Add fingerprint for duplicate detection
      if (p.fingerprint) {
        summary += `\n- fingerprint: ${p.fingerprint}`
      }
      
      // Add location information if available
      const locationParts = []
      if (p.city && p.city.trim()) locationParts.push(p.city.trim())
      if (p.state && p.state.trim()) locationParts.push(p.state.trim())
      if (p.country && p.country.trim()) locationParts.push(p.country.trim())
      if (p.zip_code && p.zip_code.trim()) locationParts.push(p.zip_code.trim())
      
      if (locationParts.length > 0) {
        summary += `\n- location: ${locationParts.join(', ')}`
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

    const selectionSystemInstructions = `You are a warm, caring grandmother selecting the most meaningful family photos for a memory book.

TASK: Select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} from the provided pool that will create the best story together.

${memoryBookContext}
PHOTO SELECTION RULES:
- You MUST select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} from the provided pool
- If there is a location named in the title match it against the city, state, country, or zip code in photo data
- Prioritize photos with a recent upload_date
- Select photos that are related to the title or event
- Choose the most meaningful and emotionally connected photos that work well together
- Consider relationships, themes, and storytelling potential when selecting
- If dates are available, use them to create a chronological or thematic flow
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
  `Use ALL ${photos.length} provided photos in the order given.` : 
  `From the ${photos.length} photos above, select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} that will create the best story together. Choose photos that are meaningful and emotionally connected.`
}`

    const selectionPrompt = `${selectionSystemInstructions}

${photoDataSection}`

    // Call OpenAI for photo selection
    console.log('🤖 Making first AI call for photo selection...')
    const selectionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a warm, caring grandmother selecting meaningful family photos.' },
          { role: 'user', content: selectionPrompt }
        ],
        max_tokens: 1000
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
      
      // Add location information if available
      const locationParts = []
      if (p.city && p.city.trim()) locationParts.push(p.city.trim())
      if (p.state && p.state.trim()) locationParts.push(p.state.trim())
      if (p.country && p.country.trim()) locationParts.push(p.country.trim())
      if (p.zip_code && p.zip_code.trim()) locationParts.push(p.zip_code.trim())
      
      if (locationParts.length > 0) {
        summary += `\n- location: ${locationParts.join(', ')}`
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

    const storySystemInstructions = `You are a warm, pithy, witty, hip and playful, grandmother creating personalized family stories from photos.

TASK: Create a 1-2 sentence story that connects the selected photos into a cohesive narrative.

RESTRICTIONS:
- Keep the story PG
- Never use the location "West Ridge" 
- Do not say "young ones" or "youngsters" use "kids" or "children"

STYLE REQUIREMENTS:
- Warm, fun, and lighthearted tone like a hip grandma
- But not too sappy or corny
- 8th grade reading level
- Natural, personal, and delightful language
- Use photo context (captions, tags, people) for richness, but don't mention them literally
- Refer to location information if available to make the story more specific and personal
- IMPORTANT: Only use letters and symbols from the Latin character set (no Hebrew, Cyrillic, or other scripts). All output must be in English and use only Latin characters.

${memoryBookContext}
STORY GUIDELINES:
- Weave together the selected photos into a single cohesive story
- Focus on relationships, emotions, and shared experiences
- Make it feel like a personal family memory
- Use 1-2 sentences maximum`

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

    // Call OpenAI for story generation
    console.log('🤖 Making second AI call for story generation...')
    const storyRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a warm, witty Hallmark card writer.' },
          { role: 'user', content: storyPrompt }
        ],
        max_tokens: 1000
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