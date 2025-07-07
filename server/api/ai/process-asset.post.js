// AI processing endpoint for assets
// Handles image analysis, caption generation, and tagging using OpenAI

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { assetId, assetType, storageUrl, userCaption } = body

    if (!assetId || !assetType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: assetId, assetType'
      })
    }

    const config = useRuntimeConfig()
    const openaiApiKey = config.openaiApiKey

    if (!openaiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenAI API key not configured'
      })
    }

    let aiResults = {
      ai_caption: '',
      tags: [],
      people_detected: [],
      ai_processed: true
    }

    if (assetType === 'photo' && storageUrl) {
      // Process image with OpenAI Vision API
      const imageAnalysis = await analyzeImage(storageUrl, openaiApiKey)
      aiResults = {
        ...aiResults,
        ...imageAnalysis
      }
    } else if (assetType === 'text' && userCaption) {
      // Process text content
      const textAnalysis = await analyzeText(userCaption, openaiApiKey)
      aiResults = {
        ...aiResults,
        ...textAnalysis
      }
    }

    // Update asset with AI results
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('assets')
      .update(aiResults)
      .eq('id', assetId)
      .select()
      .single()

    if (error) {
      console.error('Error updating asset with AI results:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update asset with AI results'
      })
    }

    return {
      success: true,
      data,
      aiResults
    }

  } catch (error) {
    console.error('AI processing error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'AI processing failed'
    })
  }
})

// Analyze image using OpenAI Vision API
async function analyzeImage(imageUrl, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes family photos and generates:
1. A playful, meaningful caption (2-3 sentences)
2. Relevant tags (family, events, emotions, activities)
3. People/objects detected (names if mentioned, relationships, objects)

Respond in JSON format:
{
  "caption": "playful caption here",
  "tags": ["family", "celebration", "outdoors"],
  "people_detected": ["grandma", "kids", "dog"],
  "objects": ["cake", "balloons"]
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this family photo and provide the requested information in JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    // Parse JSON response
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch (e) {
      // Fallback if JSON parsing fails
      parsed = {
        caption: content || 'A beautiful family moment captured forever.',
        tags: ['family', 'memory'],
        people_detected: [],
        objects: []
      }
    }

    return {
      ai_caption: parsed.caption || 'A beautiful family moment captured forever.',
      tags: parsed.tags || ['family', 'memory'],
      people_detected: [...(parsed.people_detected || []), ...(parsed.objects || [])]
    }

  } catch (error) {
    console.error('Image analysis error:', error)
    return {
      ai_caption: 'A beautiful family moment captured forever.',
      tags: ['family', 'memory'],
      people_detected: []
    }
  }
}

// Analyze text content using OpenAI
async function analyzeText(text, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes family stories and generates:
1. A playful, meaningful caption (2-3 sentences)
2. Relevant tags (family, events, emotions, activities)

Respond in JSON format:
{
  "caption": "playful caption here",
  "tags": ["family", "story", "memory"]
}`
          },
          {
            role: 'user',
            content: `Analyze this family story: "${text}"`
          }
        ],
        max_tokens: 300
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    // Parse JSON response
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch (e) {
      // Fallback if JSON parsing fails
      parsed = {
        caption: content || 'A precious family story to cherish.',
        tags: ['family', 'story']
      }
    }

    return {
      ai_caption: parsed.caption || 'A precious family story to cherish.',
      tags: parsed.tags || ['family', 'story'],
      people_detected: []
    }

  } catch (error) {
    console.error('Text analysis error:', error)
    return {
      ai_caption: 'A precious family story to cherish.',
      tags: ['family', 'story'],
      people_detected: []
    }
  }
} 