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
    const { photos, forceAll, title, theme, memory_event } = body // Array of { id, ai_caption, people_detected, tags, user_tags }, and forceAll boolean, plus memory book fields
    if (!photos || !Array.isArray(photos) || photos.length < 1) {
      throw createError({ statusCode: 400, statusMessage: 'At least 1 photo is required' })
    }

    // Construct prompt for OpenAI
    const photoSummaries = photos.map((p, i) =>
      `Photo ${i+1}:\n- id: ${p.id}\n- ai_caption: ${p.ai_caption || ''}\n- people_detected: ${(p.people_detected||[]).join(', ')}\n- tags: ${(p.tags||[]).join(', ')}\n- user_tags: ${(p.user_tags||[]).join(', ')}`
    ).join('\n\n')

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

TASK: Create a 2-3 sentence story that connects 4 meaningful photos into a cohesive narrative.

STYLE REQUIREMENTS:
- Warm, fun, and heartfelt tone like a Hallmark card
- 8th grade reading level
- Natural, personal, and delightful language
- Use photo context (captions, tags, people) for richness, but don't mention them literally

${memoryBookContext}
STORY GUIDELINES:
- ALWAYS select exactly 4 photos when 4 or more are available
- Choose the most meaningful or emotionally connected photos, even if not perfect fits
- Weave together the photos into a single cohesive story
- Focus on relationships, emotions, and shared experiences
- Make it feel like a personal family memory`

    // Photo data section
    const photoDataSection = `PHOTO METADATA:
${photoSummaries}

INSTRUCTIONS:
${forceAll ? 
  'Use ALL provided photos in the order given.' : 
  'ALWAYS select exactly 4 photos when available. Choose the most meaningful ones, even if not perfect fits, and arrange them in the best storytelling order.'
}

RESPONSE FORMAT:
Return ONLY a valid JSON object with these exact fields:
{
  "selected_photo_ids": ["photo_id_1", "photo_id_2", "photo_id_3", "photo_id_4"],
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

    // Parse JSON from AI response
    let result
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (err) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to parse AI response: ' + err.message })
    }

    if (!result.selected_photo_ids || !result.story) {
      throw createError({ statusCode: 500, statusMessage: 'AI response missing required fields' })
    }

    return {
      success: true,
      selected_photo_ids: result.selected_photo_ids,
      story: result.story
    }
  } catch (error) {
    console.error('Magic Memory AI error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate Magic Memory'
    })
  }
}) 