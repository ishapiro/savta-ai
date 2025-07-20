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

    // Construct prompt for OpenAI with numbered photos (zero-padded for reliability)
    const photoSummaries = photos.map((p, i) => {
      const photoNumber = i + 1
      const paddedNumber = photoNumber.toString().padStart(3, '0') // 001, 012, 123, etc.
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
- If there is a location named in the title match it against the location in the photo metadata
- Select photos that are related to the title, theme or event
- Choose the most meaningful and emotionally connected photos that work well together
- Consider relationships, themes, and storytelling potential when selecting
- If dates are available, use them to create a chronological or thematic flow
- ${targetPhotoCount === 1 ? 'For single photos, prioritize portrait orientation when available for better layout' : 'Arrange selected photos in the best storytelling order'}
- CRITICAL: When selecting photos, use the exact UUID string from the "id:" field, not the photo number
- CRITICAL: Copy the photo ID EXACTLY as shown - do not modify, change, or generate new IDs
- CRITICAL: The photo ID must match character-for-character with the provided UUID

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
  "selected_photo_numbers": [${targetPhotoCount > 1 ? '1' : ''}${targetPhotoCount > 2 ? ', 2' : ''}${targetPhotoCount > 3 ? ', 3' : ''}${targetPhotoCount > 4 ? ', 4' : ''}${targetPhotoCount > 5 ? ', 5' : ''}${targetPhotoCount > 6 ? ', 6' : ''}],
  "story": "Your 2-3 sentence story here..."
}

EXAMPLE:
If you want to select photos 001 and 003 from the pool, your response should look like this EXACT format:
{
  "selected_photo_numbers": [1, 3],
  "story": "Your story here..."
}

IMPORTANT: 
- Only include photo numbers that exist in the provided pool (1 to ${photos.length})
- Select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''}, no more, no less
- Use the photo numbers (1, 2, 3, etc.) NOT the photo IDs
- Photo numbers correspond to the "Photo X:" entries above`

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