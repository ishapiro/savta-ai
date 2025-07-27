// Magic Memory AI endpoint
// Receives photo metadata, selects 4 most meaningful, and generates a story

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      throw createError({ statusCode: 500, statusMessage: 'OpenAI API key not configured' })
    }

    const body = await readBody(event)
    let { photos, forceAll, title, theme, memory_event, photo_count = 4, background_type = 'white', background_color } = body // Array of { id, ai_caption, people_detected, tags, user_tags }, and forceAll boolean, plus memory book fields
    if (!photos || !Array.isArray(photos) || photos.length < 1) {
      throw createError({ statusCode: 400, statusMessage: 'At least 1 photo is required' })
    }

    // Validate photo_count
    const validPhotoCounts = [1, 4, 6]
    const targetPhotoCount = validPhotoCounts.includes(photo_count) ? photo_count : 4

    // Construct prompt for OpenAI with numbered photos (zero-padded for reliability)
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

    // Build memory book context string
    let memoryBookContext = ''
    if (title && title.trim()) {
      memoryBookContext += `Title: "${title.trim()}"\n`
    }
    if (memory_event && memory_event.trim()) {
      memoryBookContext += `Event: ${memory_event.trim()}\n`
    }
    if (theme && theme.trim()) {
      memoryBookContext += `Theme: "${theme.trim()}"\n`
    }

    // System context and instructions
    const systemInstructions = `You are a warm, witty , hip and playful, grandmother creating personalized family stories from photos.

TASK: Select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} from the provided pool and create a 2-3 sentence story that connects them into a cohesive narrative.

RESTRICTIONS:
- Keep the story PG
- Never use the location "West Ridge" 
- Do not say "young ones" or "youngsters" use "kids" or "children"

STYLE REQUIREMENTS:
- Warm, fun, and lighthearted tone like a Hallmark card
- But not too sappy or corny
- 8th grade reading level
- Natural, personal, and delightful language
- Use photo context (captions, tags, people) for richness, but don't mention them literally
- Refer to location information if available to make the story more specific and personal
- IMPORTANT: Only use letters and symbols from the Latin character set (no Hebrew, Cyrillic, or other scripts). All output must be in English and use only Latin characters.

${memoryBookContext}
PHOTO SELECTION RULES:
- You MUST select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} from the provided pool
- If there is a location named in the title match it against the city, state, country, or zip code in photo data
- Prioritize photos with a recent upload_date
- Select photos that are related to the title, theme or event
- Choose the most meaningful and emotionally connected photos that work well together
- Consider relationships, themes, and storytelling potential when selecting
- If dates are available, use them to create a chronological or thematic flow
- Arrange selected photos in the best storytelling order
- CRITICAL: Use the photo numbers (1, 2, 3, etc.) exactly as shown in the "Photo X:" labels
- CRITICAL: Copy the photo numbers EXACTLY - do not modify, change, or generate new numbers
- CRITICAL: The photo numbers must match exactly with the provided pool
- CRITICAL: Do NOT select photos with the same fingerprint - each selected photo must have a unique fingerprint

STORY GUIDELINES:
- Weave together the selected photos into a single cohesive story
- Focus on relationships, emotions, and shared experiences
- Make it feel like a personal family memory
- Use 2-3 sentences maximum`

    // Photo data section
    const photoDataSection = `PHOTO SELECTION POOL (${photos.length} photos available):
${photoSummaries}

SELECTION INSTRUCTIONS:
${forceAll ? 
  `Use ALL ${photos.length} provided photos in the order given.` : 
  `From the ${photos.length} photos above, select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} that will create the best story together. Choose photos that are meaningful and emotionally connected.`
}

RESPONSE FORMAT:
Return ONLY a valid JSON object with these exact fields:
{
  "selected_photo_numbers": [1, 2, 3, 4],
  "story": "Your 2-3 sentence story here..."
}

EXAMPLE:
If you want to select photos 1, 2, 3, and 4 from the pool, your response should look like this EXACT format:
{
  "selected_photo_numbers": [1, 2, 3, 4],
  "story": "Your story here..."
}

IMPORTANT: 
- Only include photo numbers that exist in the provided pool (1 to ${photos.length})
- Select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''}, no more, no less
- Use plain photo numbers (1, 2, 3, etc.) without leading zeros - NOT 001, 002, 003
- Photo numbers correspond to the "Photo X:" entries above (ignore the zero-padding in labels)`

    // Calculate prompt length and limit photos if necessary
    let finalPrompt = `${systemInstructions}

${photoDataSection}`
    
    const maxPromptLength = 10000 // Increased from 4000 to allow many more photos
    let photosToInclude = photos
    let truncatedPhotoCount = 0
    
    // If prompt is too long, use intelligent photo selection based on character contribution
    if (finalPrompt.length > maxPromptLength) {
      console.log(`⚠️ Initial prompt too long (${finalPrompt.length} chars), using intelligent photo selection...`)
      
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
        
        const fullPhotoText = photoSummary + locationInfo + dateInfo
        const characterCount = fullPhotoText.length
        
        return {
          photo: p,
          index: index,
          characterCount: characterCount,
          photoText: fullPhotoText
        }
      })
      
      // Sort by date (newest first) to prioritize recent photos
      photoContributions.sort((a, b) => new Date(b.photo.created_at) - new Date(a.photo.created_at))
      
      // Build the prompt with photos until we reach the limit
      let currentPrompt = systemInstructions + '\n\n'
      let selectedPhotos = []
      let totalCharacters = currentPrompt.length
      
      // Add the instruction text that comes before photos
      const instructionPrefix = `TASK: Select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} from the provided pool and create a 2-3 sentence story that connects them into a cohesive narrative.

RESTRICTIONS:
- Keep the story PG
- Never use the location "West Ridge" 
- Do not say "young ones" or "youngsters" use "kids" or "children"

STYLE REQUIREMENTS:
- Warm, fun, and lighthearted tone like a Hallmark card
- But not too sappy or corny
- 8th grade reading level
- Natural, personal, and delightful language
- Use photo context (captions, tags, people) for richness, but don't mention them literally
- Refer to location information if available to make the story more specific and personal
- IMPORTANT: Only use letters and symbols from the Latin character set (no Hebrew, Cyrillic, or other scripts). All output must be in English and use only Latin characters.

Title: "${title}"
Theme: "${theme}"

PHOTO SELECTION RULES:
- You MUST select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} from the provided pool
- If there is a location named in the title match it against the city, state, country, or zip code in photo data
- Prioritize photos with a recent upload_date
- Select photos that are related to the title, theme or event
- Choose the most meaningful and emotionally connected photos that work well together
- Consider relationships, themes, and storytelling potential when selecting
- If dates are available, use them to create a chronological or thematic flow
- Arrange selected photos in the best storytelling order
- CRITICAL: Use the photo numbers (1, 2, 3, etc.) exactly as shown in the "Photo X:" labels
- CRITICAL: Copy the photo numbers EXACTLY - do not modify, change, or generate new numbers
- CRITICAL: The photo numbers must match exactly with the provided pool

STORY GUIDELINES:
- Weave together the selected photos into a single cohesive story
- Focus on relationships, emotions, and shared experiences
- Make it feel like a personal family memory
- Use 2-3 sentences maximum

PHOTO SELECTION POOL (`
      
      const instructionSuffix = ` photos available):

SELECTION INSTRUCTIONS:
${forceAll ? 
  `Use ALL ` : 
  `From the `} photos above, select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} that will create the best story together. Choose photos that are meaningful and emotionally connected.

RESPONSE FORMAT:
Return ONLY a valid JSON object with these exact fields:
{
  "selected_photo_numbers": [1, 2, 3, 4],
  "story": "Your 2-3 sentence story here..."
}

EXAMPLE:
If you want to select photos 1, 2, 3, and 4 from the pool, your response should look like this EXACT format:
{
  "selected_photo_numbers": [1, 2, 3, 4],
  "story": "Your story here..."
}

IMPORTANT: 
- Only include photo numbers that exist in the provided pool (1 to )
- Select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''}, no more, no less
- Use plain photo numbers (1, 2, 3, etc.) without leading zeros - NOT 001, 002, 003
- Photo numbers correspond to the "Photo X:" entries above (ignore the zero-padding in labels)`
      
      // Add instruction prefix
      currentPrompt += instructionPrefix
      totalCharacters += instructionPrefix.length
      
      // Add photos one by one until we reach the limit
      for (const contribution of photoContributions) {
        const photoWithSeparator = contribution.photoText + '\n\n'
        const newTotal = totalCharacters + photoWithSeparator.length + instructionSuffix.length + contribution.index.toString().length + 10 // Buffer for photo count
        
        if (newTotal <= maxPromptLength) {
          selectedPhotos.push(contribution)
          totalCharacters += photoWithSeparator.length
        } else {
          break
        }
      }
      
      // Sort selected photos back to original order
      selectedPhotos.sort((a, b) => a.index - b.index)
      
      // Build the final prompt with selected photos
      const selectedPhotoTexts = selectedPhotos.map((contribution, i) => {
        const photoNumber = i + 1
        const paddedNumber = photoNumber.toString().padStart(3, '0')
        return contribution.photoText.replace(/^Photo \d+:/, `Photo ${paddedNumber}:`)
      }).join('\n\n')
      
      finalPrompt = `${systemInstructions}

${instructionPrefix}${selectedPhotos.length}${instructionSuffix.replace('photos available):', 'photos available):\n' + selectedPhotoTexts)}`
      
      photosToInclude = selectedPhotos.map(c => c.photo)
      truncatedPhotoCount = photos.length - selectedPhotos.length
      
      console.log(`📊 Intelligent photo selection: ${selectedPhotos.length} photos selected (${truncatedPhotoCount} removed)`)
      console.log(`📊 Total characters: ${finalPrompt.length}/${maxPromptLength}`)
    }
    
    // Update the photos array to use the limited set
    photos = photosToInclude

    console.log("****************************")
    console.log("magic story prompt")
    console.log("****************************")
    console.log(`Target photo count: ${targetPhotoCount}`)
    console.log(`Available photos: ${photos.length}`)
    console.log(`Force all: ${forceAll}`)
    if (truncatedPhotoCount > 0) {
      console.log(`⚠️ Prompt was too long, reduced from ${photos.length + truncatedPhotoCount} to ${photos.length} photos`)
    }
    console.log("Available photo IDs:", photos.map(p => p.id))
    console.log("First 5 photo IDs being sent to AI:", photos.slice(0, 5).map(p => p.id))
    console.log(`Final prompt length: ${finalPrompt.length} characters`)
    console.log(finalPrompt)
    console.log("****************************")

    // Call OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a warm, witty Hallmark card writer.' },
          { role: 'user', content: finalPrompt }
        ],
        max_tokens: 3000
      })
    })

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text()
      throw createError({ statusCode: 500, statusMessage: `OpenAI API error: ${errorText}` })
    }

    const openaiData = await openaiRes.json()
    const aiText = openaiData.choices[0].message.content

    console.log("****************************")
    console.log("AI response received")
    console.log("****************************")
    console.log(aiText)
    console.log("****************************")

    // Clean up JSON response - remove leading zeros from photo numbers
    let cleanedAiText = aiText
    try {
      // Replace leading zeros in photo numbers (e.g., 021 -> 21, 003 -> 3)
      cleanedAiText = aiText.replace(/"selected_photo_numbers":\s*\[([^\]]+)\]/g, (match, numbers) => {
        const cleanedNumbers = numbers.split(',').map(num => {
          const trimmed = num.trim()
          // Remove leading zeros but keep the number
          return parseInt(trimmed, 10).toString()
        }).join(', ')
        return `"selected_photo_numbers": [${cleanedNumbers}]`
      })
      
      if (cleanedAiText !== aiText) {
        console.log("****************************")
        console.log("Cleaned JSON (removed leading zeros)")
        console.log("****************************")
        console.log(cleanedAiText)
        console.log("****************************")
      }
    } catch (cleanupErr) {
      console.warn('⚠️ JSON cleanup failed, proceeding with original:', cleanupErr.message)
      cleanedAiText = aiText
    }

    // Parse JSON from AI response
    let result
    try {
      const jsonMatch = cleanedAiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
        console.log("****************************")
        console.log("Parsed JSON result")
        console.log("****************************")
        console.log(JSON.stringify(result, null, 2))
        console.log("****************************")
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (err) {
      console.error('JSON parsing error:', err)
      console.error('Raw AI response:', aiText)
      console.error('Cleaned AI response:', cleanedAiText)
      
      // Fallback: use all photos in order with a simple story
      console.log('⚠️ AI failed to generate story, using fallback')
      const fallbackResult = {
        selected_photo_numbers: Array.from({ length: Math.min(targetPhotoCount, photos.length) }, (_, i) => i + 1),
        story: `A beautiful collection of family moments captured with love. Each photo tells its own story, and together they create a tapestry of memories that will be cherished for years to come.`
      }
      result = fallbackResult
      console.log('Fallback result:', result)
    }

    if (!result.selected_photo_numbers || !result.story) {
      throw createError({ statusCode: 500, statusMessage: 'AI response missing required fields' })
    }

    // Validate that selected photo numbers exist in the provided pool
    const availablePhotoNumbers = Array.from({ length: photos.length }, (_, i) => i + 1)
    const invalidPhotoNumbers = result.selected_photo_numbers.filter(num => !availablePhotoNumbers.includes(num))
    
    console.log("****************************")
    console.log("Photo selection validation")
    console.log("****************************")
    console.log(`Target photo count: ${targetPhotoCount}`)
    console.log(`AI selected count: ${result.selected_photo_numbers.length}`)
    console.log(`AI selected numbers: ${result.selected_photo_numbers}`)
    console.log(`Available numbers: ${availablePhotoNumbers}`)
    console.log(`Invalid numbers: ${invalidPhotoNumbers}`)
    console.log("****************************")
    
    if (invalidPhotoNumbers.length > 0) {
      console.error('AI selected invalid photo numbers:', invalidPhotoNumbers)
      console.error('Available photo numbers:', availablePhotoNumbers)
      
      // Filter out invalid numbers and keep only valid ones
      const validPhotoNumbers = result.selected_photo_numbers.filter(num => availablePhotoNumbers.includes(num))
      
      console.log(`Valid photo numbers: ${validPhotoNumbers.length}/${targetPhotoCount}`)
      console.log(`Invalid numbers: ${invalidPhotoNumbers.length}`)
      
      if (validPhotoNumbers.length === 0) {
        throw createError({ statusCode: 500, statusMessage: `No valid photo numbers found. AI selected all invalid numbers: ${invalidPhotoNumbers.join(', ')}` })
      }
      
      if (validPhotoNumbers.length < targetPhotoCount) {
        console.warn(`⚠️ Only ${validPhotoNumbers.length} valid photos found, proceeding with fewer photos than requested (${targetPhotoCount})`)
      }
      
      // Use the valid numbers
      result.selected_photo_numbers = validPhotoNumbers
      console.log('Final valid photo numbers:', validPhotoNumbers)
    }

    // Convert photo numbers to actual photo IDs
    const selectedPhotoIds = result.selected_photo_numbers.map(num => photos[num - 1].id)
    console.log('✨ Magic story and selected photos updated successfully')
    console.log('Selected photo IDs:', selectedPhotoIds)

    // Validate that we have at least some photos selected
    if (selectedPhotoIds.length < 1) {
      console.error(`AI selected ${selectedPhotoIds.length} photos, need at least 1`)
      throw createError({ statusCode: 500, statusMessage: `AI selected ${selectedPhotoIds.length} photos, need at least 1` })
    }
    
    // Warn if we have fewer photos than requested, but proceed
    if (selectedPhotoIds.length < targetPhotoCount) {
      console.warn(`⚠️ AI selected ${selectedPhotoIds.length} photos, requested ${targetPhotoCount}. Proceeding with available photos.`)
    }

    return {
      success: true,
      selected_photo_ids: selectedPhotoIds,
      story: result.story,
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