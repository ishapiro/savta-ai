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
    const { photos, forceAll } = body // Array of { id, ai_caption, people_detected, tags, user_tags }, and forceAll boolean
    if (!photos || !Array.isArray(photos) || photos.length < 1) {
      throw createError({ statusCode: 400, statusMessage: 'At least 1 photo is required' })
    }

    // Construct prompt for OpenAI
    const photoSummaries = photos.map((p, i) =>
      `Photo ${i+1}:\n- id: ${p.id}\n- ai_caption: ${p.ai_caption || ''}\n- people_detected: ${(p.people_detected||[]).join(', ')}\n- tags: ${(p.tags||[]).join(', ')}\n- user_tags: ${(p.user_tags||[]).join(', ')}`
    ).join('\n\n')

    // Prose description for the AI
    const proseDescription = `You are a warm, witty Hallmark card writer. 
Given the following photo metadata, select the 4 most meaningful or emotionally connected photos 
(if more than 4 are provided). Write a single 3–4 sentence message that ties these photos together. 
The message should sound like a Hallmark card: warm, fun, and heartfelt. Use as much of the ai_captions, 
tags, user_tags, and people_detected as possible to make the story rich and specific, but do not include photo IDs or titles. 
Use tags, user_tags, and people_detected for context, relationships, or activities, but not as literal words. 
The story should feel natural, personal, and delightful.`

    // Formatting instructions for the AI
    const formattingInstructionsForceAll = `Return a JSON object with two fields:
 - selected_photo_ids: an array of ALL the provided photo IDs in the order given
 - story: the story text

 Photo metadata:
 ${photoSummaries}`

    const formattingInstructionsSelect = `Return a JSON object with two fields:
 - selected_photo_ids: an array of the 4 most meaningful photo IDs you selected, in the order you chose them
 - story: the story text

 Photo metadata:
 ${photoSummaries}`

    let prompt
    if (forceAll) {
      prompt = `${proseDescription}\n\n${formattingInstructionsForceAll}`
    } else {
      prompt = `${proseDescription}\n\n${formattingInstructionsSelect}`
    }

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
        max_tokens: 600
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