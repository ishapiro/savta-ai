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

    // Validate asset ID format
    if (typeof assetId !== 'string' || assetId.length < 10) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid asset ID format'
      })
    }

    const config = useRuntimeConfig()
    const openaiApiKey = config.openaiApiKey

    // Check if OpenAI API key is configured
    if (!openaiApiKey) {
      
      // Use fallback processing without AI
      const fallbackResults = {
        ai_caption: assetType === 'photo' 
          ? 'A beautiful family moment captured forever.' 
          : 'A precious family story to cherish.',
        tags: assetType === 'photo' ? ['family', 'memory'] : ['family', 'story'],
        people_detected: [],
        ai_processed: true
      }

      // Update asset with fallback results
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabase = createClient(
        config.public.supabaseUrl,
        config.public.supabaseKey
      )
      
      try {
        // First, check if the asset exists
        const { data: existingAsset, error: checkError } = await supabase
          .from('assets')
          .select('id, user_id')
          .eq('id', assetId)
          .single()

        if (checkError) {
          throw createError({
            statusCode: 404,
            statusMessage: `Asset not found: ${assetId}`
          })
        }

        // Now update the asset
        const { data, error } = await supabase
          .from('assets')
          .update(fallbackResults)
          .eq('id', assetId)
          .select()
          .single()

        if (error) {
          throw createError({
            statusCode: 500,
            statusMessage: `Failed to update asset with fallback results: ${error.message}`
          })
        }

      } catch (dbError) {
        throw createError({
          statusCode: 500,
          statusMessage: `Database update failed: ${dbError.message}`
        })
      }

      return {
        success: true,
        data,
        aiResults: fallbackResults,
        message: 'Processed with fallback (OpenAI API key not configured)'
      }
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
    } else {
      // Fallback for missing data
      aiResults = {
        ai_caption: assetType === 'photo' 
          ? 'A beautiful family moment captured forever.' 
          : 'A precious family story to cherish.',
        tags: assetType === 'photo' ? ['family', 'memory'] : ['family', 'story'],
        people_detected: [],
        ai_processed: true
      }
    }

    // Update asset with AI results
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
    
    let updatedAsset = null;
    let aiUpdate = null;
      
      try {
        // First, check if the asset exists
        
        const { data: existingAsset, error: checkError } = await supabase
          .from('assets')
          .select('id, user_id')
          .eq('id', assetId)
          .single()

        if (checkError) {
          throw createError({
            statusCode: 404,
            statusMessage: `Asset not found: ${assetId}`
          })
        }

        // Only update the relevant fields
        aiUpdate = {
          ai_caption: aiResults.ai_caption,
          tags: aiResults.tags,
          people_detected: aiResults.people_detected,
          ai_objects: aiResults.ai_objects,
          ai_raw: aiResults.ai_raw,
          ai_processed: true
        };
        const { data, error } = await supabase
          .from('assets')
          .update(aiUpdate)
          .eq('id', assetId)
          .select()
          .single();

        if (error) {
          throw createError({
            statusCode: 500,
            statusMessage: `Failed to update asset with AI results: ${error.message}`
          })
        }

        updatedAsset = data
      } catch (dbError) {
        throw createError({
          statusCode: 500,
          statusMessage: `Database update failed: ${dbError.message}`
        })
      }

    return {
      success: true,
      data: updatedAsset,
      aiResults: aiUpdate
    }

  } catch (error) {
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    let cleanContent = content.replace(/```json|```/gi, '').trim();
    // If there's a JSON object after a preamble, extract it
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
    }
    let parsed;
    try {
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      // Fallback if JSON parsing fails
      parsed = {
        caption: content || 'A beautiful family moment captured forever.',
        tags: ['family', 'memory'],
        people_detected: [],
        objects: []
      };
    }

    const finalResults = {
      ai_caption: parsed.caption || 'A beautiful family moment captured forever.',
      tags: parsed.tags || ['family', 'memory'],
      people_detected: parsed.people_detected || [],
      ai_objects: parsed.objects || [],
      ai_raw: parsed // Store the full parsed object
    };

    return finalResults

  } catch (error) {
    throw {
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
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
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    let cleanContent = content.replace(/```json|```/gi, '').trim();
    // If there's a JSON object after a preamble, extract it
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
    }
    let parsed;
    try {
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      // Fallback if JSON parsing fails
      parsed = {
        caption: content || 'A precious family story to cherish.',
        tags: ['family', 'story']
      }
    }

    const finalResults = {
      ai_caption: parsed.caption || 'A precious family story to cherish.',
      tags: parsed.tags || ['family', 'story'],
      people_detected: [],
      ai_objects: [],
      ai_raw: parsed
    };

    return finalResults

  } catch (error) {
    throw {
      ai_caption: 'A precious family story to cherish.',
      tags: ['family', 'story'],
      people_detected: []
    }
  }
} 