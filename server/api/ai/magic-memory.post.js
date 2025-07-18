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

TASK: Create a 2-3 sentence story that connects ${targetPhotoCount} meaningful photo${targetPhotoCount > 1 ? 's' : ''} into a cohesive narrative.

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
STORY GUIDELINES:
- ALWAYS select exactly ${targetPhotoCount} photo ${targetPhotoCount > 1 ? 's' : ''} when ${targetPhotoCount} or more are available
- Choose the most meaningful or emotionally connected photos, even if not perfect fits
- Weave together the photos into a single cohesive story
- Focus on relationships, emotions, and shared experiences
- Make it feel like a personal family memory ${targetPhotoCount === 1 ? `
PHOTO SELECTION FOR SINGLE PHOTO:
- When selecting 1 photo, prioritize photos with orientation="portrait" 
- Portrait photos work best for single-photo layouts as they can fill 50% of the card area effectively
- If no portrait photos are available, choose landscape photos that can be effectively cropped to portrait
- Look for photos with good vertical composition or subjects that can be centered in a portrait crop` : ''}`

    // Photo data section
    const photoDataSection = `PHOTO METADATA:
${photoSummaries}

INSTRUCTIONS:
${forceAll ? 
  `Use ALL provided photos in the order given.` : 
  `You have access to ${photos.length} photos from the user's selection pool. ALWAYS select exactly ${targetPhotoCount} photo${targetPhotoCount > 1 ? 's' : ''} for the story. Choose the most meaningful and emotionally connected photos from this pool, even if not perfect fits, and arrange them in the best storytelling order. Consider the relationships and themes across all photos in the pool when making your selection.`
}

RESPONSE FORMAT:
Return ONLY a valid JSON object with these exact fields:
{
  "selected_photo_ids": ["photo_id_1"${targetPhotoCount > 1 ? ', "photo_id_2"' : ''}${targetPhotoCount > 2 ? ', "photo_id_3"' : ''}${targetPhotoCount > 3 ? ', "photo_id_4"' : ''}${targetPhotoCount > 4 ? ', "photo_id_5"' : ''}${targetPhotoCount > 5 ? ', "photo_id_6"' : ''}],
  "story": "Your 2-3 sentence story here..."
}`

    const prompt = `${systemInstructions}

${photoDataSection}`

    console.log("****************************")
    console.log("magic story prompt")
    console.log("****************************")
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