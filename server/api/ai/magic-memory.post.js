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
    const { photos, forceAll, title, theme, memory_event, photo_count = 4, background_type = 'white' } = body // Array of { id, ai_caption, people_detected, tags, user_tags }, and forceAll boolean, plus memory book fields
    if (!photos || !Array.isArray(photos) || photos.length < 1) {
      throw createError({ statusCode: 400, statusMessage: 'At least 1 photo is required' })
    }

    // Validate photo_count
    const validPhotoCounts = [1, 4, 6]
    const targetPhotoCount = validPhotoCounts.includes(photo_count) ? photo_count : 4

    // Construct prompt for OpenAI
    const photoSummaries = photos.map((p, i) => {
      let summary = `Photo ${i+1}:\n- id: ${p.id}\n- orientation: ${p.orientation || 'unknown'}\n- dimensions: ${p.width || 'unknown'}x${p.height || 'unknown'}\n- ai_caption: ${p.ai_caption || ''}\n- people_detected: ${(p.people_detected||[]).join(', ')}\n- tags: ${(p.tags||[]).join(', ')}\n- user_tags: ${(p.user_tags||[]).join(', ')}`
      
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
    const systemInstructions = `You are a warm, witty Hallmark card writer creating personalized family stories from photos.

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
- Choose the most meaningful and emotionally connected photos that work well together
- Consider relationships, themes, and storytelling potential when selecting
- If dates are available, use them to create a chronological or thematic flow
- ${targetPhotoCount === 1 ? 'For single photos, prioritize portrait orientation when available for better layout' : 'Arrange selected photos in the best storytelling order'}
- CRITICAL: When selecting photos, use the exact UUID string from the "id:" field, not the photo number

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
  "selected_photo_ids": ["photo_id_1"${targetPhotoCount > 1 ? ', "photo_id_2"' : ''}${targetPhotoCount > 2 ? ', "photo_id_3"' : ''}${targetPhotoCount > 3 ? ', "photo_id_4"' : ''}${targetPhotoCount > 4 ? ', "photo_id_5"' : ''}${targetPhotoCount > 5 ? ', "photo_id_6"' : ''}],
  "story": "Your 2-3 sentence story here..."
}

EXAMPLE:
If you want to select the first and third photos from the pool, your response should look like:
{
  "selected_photo_ids": ["3d19fc8e-48ef-4efd-bc48-e2e31c354055", "01dfc37f-b546-4b9c-b2f9-310f5fa81839"],
  "story": "Your story here..."
}

IMPORTANT: 
- Only include photo IDs that exist in the provided pool
- Select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''}, no more, no less
- Ensure all selected photo IDs match exactly with the IDs in the pool above
- CRITICAL: Use the exact UUID strings (like "3d19fc8e-48ef-4efd-bc48-e2e31c354055") as photo IDs, NOT the photo numbers (like "1", "2", "3")
- The photo ID is the long string after "id:" in each photo entry`

    const prompt = `${systemInstructions}

${photoDataSection}`

    console.log("****************************")
    console.log("magic story prompt")
    console.log("****************************")
    console.log(`Target photo count: ${targetPhotoCount}`)
    console.log(`Available photos: ${photos.length}`)
    console.log(`Force all: ${forceAll}`)
    console.log("Available photo IDs:", photos.map(p => p.id))
    console.log("First 5 photo IDs being sent to AI:", photos.slice(0, 5).map(p => p.id))
    console.log(prompt)
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
          { role: 'user', content: prompt }
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

    // Parse JSON from AI response
    let result
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
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
      throw createError({ statusCode: 500, statusMessage: 'Failed to parse AI response: ' + err.message })
    }

    if (!result.selected_photo_ids || !result.story) {
      throw createError({ statusCode: 500, statusMessage: 'AI response missing required fields' })
    }

    // Validate that selected photo IDs exist in the provided pool
    const availablePhotoIds = photos.map(p => p.id)
    const invalidPhotoIds = result.selected_photo_ids.filter(id => !availablePhotoIds.includes(id))
    
    console.log("****************************")
    console.log("Photo selection validation")
    console.log("****************************")
    console.log(`Target photo count: ${targetPhotoCount}`)
    console.log(`AI selected count: ${result.selected_photo_ids.length}`)
    console.log(`AI selected IDs: ${result.selected_photo_ids}`)
    console.log(`Available IDs: ${availablePhotoIds}`)
    console.log(`Invalid IDs: ${invalidPhotoIds}`)
    
    // Debug: Check if the AI is selecting the wrong photo from the pool
    if (invalidPhotoIds.length > 0) {
      console.log("🔍 Debugging invalid photo selection:")
      invalidPhotoIds.forEach(invalidId => {
        // Find similar IDs that might be what the AI intended
        const similarIds = availablePhotoIds.filter(validId => {
          // Check for common patterns
          return validId.includes(invalidId.slice(1)) || // Missing first char
                 invalidId.includes(validId.slice(1)) || // Extra first char
                 validId.slice(1) === invalidId.slice(1) // Same except first char
        })
        console.log(`Invalid ID "${invalidId}" might be meant to be one of:`, similarIds)
      })
    }
    console.log("****************************")
    
    if (invalidPhotoIds.length > 0) {
      console.error('AI selected invalid photo IDs:', invalidPhotoIds)
      console.error('Available photo IDs:', availablePhotoIds)
      
      // Try to fix common UUID typos by finding similar IDs
      const fixedPhotoIds = result.selected_photo_ids.map(id => {
        if (availablePhotoIds.includes(id)) {
          return id // Already valid
        }
        
        // Try to find a similar UUID by checking if it's a typo
        const similarId = availablePhotoIds.find(validId => {
          // Check if it's a simple typo (missing or extra character)
          if (validId.length === id.length + 1 && validId.includes(id)) {
            return true // Missing character
          }
          if (id.length === validId.length + 1 && id.includes(validId)) {
            return true // Extra character
          }
          
          // Check for specific common typos
          // Missing first character (like missing "9" at start)
          if (validId.length === id.length + 1 && validId.slice(1) === id) {
            console.log(`Found missing first character typo: "${id}" -> "${validId}"`)
            return true
          }
          // Extra first character (like extra "0" at start)
          if (id.length === validId.length + 1 && id.slice(1) === validId) {
            console.log(`Found extra first character typo: "${id}" -> "${validId}"`)
            return true
          }
          
          // Check if it's a single character difference
          let differences = 0
          const maxLen = Math.max(validId.length, id.length)
          for (let i = 0; i < maxLen; i++) {
            if (validId[i] !== id[i]) differences++
            if (differences > 1) break
          }
          return differences <= 1
        })
        
        if (similarId) {
          console.log(`Fixed invalid ID "${id}" to "${similarId}"`)
          return similarId
        }
        
        return null // Mark as invalid if no fix found
      })
      
      // Filter out invalid IDs and keep only valid ones
      const validPhotoIds = fixedPhotoIds.filter(id => id !== null)
      const stillInvalidIds = fixedPhotoIds.filter(id => id === null)
      
      console.log(`Valid photo IDs: ${validPhotoIds.length}/${targetPhotoCount}`)
      console.log(`Still invalid IDs: ${stillInvalidIds.length}`)
      
      if (validPhotoIds.length === 0) {
        throw createError({ statusCode: 500, statusMessage: `No valid photo IDs found. AI selected all invalid IDs: ${invalidPhotoIds.join(', ')}` })
      }
      
      if (validPhotoIds.length < targetPhotoCount) {
        console.warn(`⚠️ Only ${validPhotoIds.length} valid photos found, proceeding with fewer photos than requested (${targetPhotoCount})`)
      }
      
      // Use the valid IDs
      result.selected_photo_ids = validPhotoIds
      console.log('Final valid photo IDs:', validPhotoIds)
    }

    // Validate that we have at least some photos selected
    if (result.selected_photo_ids.length < 1) {
      console.error(`AI selected ${result.selected_photo_ids.length} photos, need at least 1`)
      throw createError({ statusCode: 500, statusMessage: `AI selected ${result.selected_photo_ids.length} photos, need at least 1` })
    }
    
    // Warn if we have fewer photos than requested, but proceed
    if (result.selected_photo_ids.length < targetPhotoCount) {
      console.warn(`⚠️ AI selected ${result.selected_photo_ids.length} photos, requested ${targetPhotoCount}. Proceeding with available photos.`)
    }

    return {
      success: true,
      selected_photo_ids: result.selected_photo_ids,
      story: result.story,
      background_type: background_type
    }
  } catch (error) {
    console.error('Magic Memory AI error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate Magic Memory'
    })
  }
}) 