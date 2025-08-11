// AI processing endpoint for assets
// Handles image analysis, caption generation, and tagging using OpenAI

import { getPromptForAssetType } from '../../utils/ai-prompts.js'

export default defineEventHandler(async (event) => {
  
  try {
    const body = await readBody(event)
    const { assetId, assetType, storageUrl, userCaption, preserveUserData, userTags, userPeople } = body

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
      const prompts = getPromptForAssetType(assetType)
      const fallbackResults = {
        ai_caption: prompts.fallback.ai_caption,
        tags: prompts.fallback.tags,
        people_detected: prompts.fallback.people_detected,
        ai_processed: true
      }

      // If preserving user data, keep user-added tags and people
      if (preserveUserData) {
        fallbackResults.user_tags = userTags || []
        fallbackResults.user_people = userPeople || []
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
      const imageAnalysis = await analyzeImage(storageUrl, openaiApiKey, {
        userTags,
        userPeople,
        peopleDetected: body.peopleDetected || [],
        tags: body.tags || []
      })
      aiResults = {
        ...aiResults,
        ...imageAnalysis
      }
    } else if (assetType === 'text' && userCaption) {
      // Process text content
      const textAnalysis = await analyzeText(userCaption, openaiApiKey, {
        userTags,
        userPeople,
        peopleDetected: body.peopleDetected || [],
        tags: body.tags || []
      })
      aiResults = {
        ...aiResults,
        ...textAnalysis
      }
    } else {
      // Fallback for missing data
      const prompts = getPromptForAssetType(assetType)
      aiResults = {
        ai_caption: prompts.fallback.ai_caption,
        tags: prompts.fallback.tags,
        people_detected: prompts.fallback.people_detected,
        ai_processed: true
      }
    }

    // Update asset with AI results
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
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
          ai_objects: aiResults.ai_objects || [],
          ai_raw: aiResults.ai_raw || null,
          ai_processed: true
        };

        // Handle location information from AI caption processing
        if (aiResults.ai_location) {
          console.log(`📍 AI caption processing found location: ${aiResults.ai_location}`)
          
          // Get current asset to check existing location
          const { data: currentAsset, error: fetchError } = await supabase
            .from('assets')
            .select('location, city, state, country, zip_code')
            .eq('id', assetId)
            .single()
          
          if (!fetchError && currentAsset) {
            let newLocation = aiResults.ai_location
            
            // If there's existing location data, append the AI location
            if (currentAsset.location && currentAsset.location.trim()) {
              console.log(`📍 Existing location found: ${currentAsset.location}`)
              console.log(`📍 Appending AI location: ${aiResults.ai_location}`)
              newLocation = `${currentAsset.location}, ${aiResults.ai_location}`
            } else if (currentAsset.city || currentAsset.state || currentAsset.country) {
              // If we have individual location components, combine them with AI location
              const existingParts = []
              if (currentAsset.city) existingParts.push(currentAsset.city)
              if (currentAsset.state) existingParts.push(currentAsset.state)
              if (currentAsset.country) existingParts.push(currentAsset.country)
              if (currentAsset.zip_code) existingParts.push(currentAsset.zip_code)
              
              if (existingParts.length > 0) {
                const existingLocation = existingParts.join(', ')
                console.log(`📍 Existing location components: ${existingLocation}`)
                newLocation = `${existingLocation}, ${aiResults.ai_location}`
              }
            }
            
            console.log(`📍 Final combined location: ${newLocation}`)
            aiUpdate.location = newLocation
          } else {
            // No existing location data, use AI location directly
            console.log(`📍 No existing location data, using AI location: ${aiResults.ai_location}`)
            aiUpdate.location = aiResults.ai_location
          }
        }

        // If preserving user data, keep user-added tags and people
        if (preserveUserData) {
          aiUpdate.user_tags = userTags || []
          aiUpdate.user_people = userPeople || []
        }
        console.log('Updating asset with AI results:', { assetId, aiUpdate })
        
        const { data, error } = await supabase
          .from('assets')
          .update(aiUpdate)
          .eq('id', assetId)
          .select()
          .single();

        if (error) {
          console.error('Database update error:', error)
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
    console.error('AI processing error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'AI processing failed'
    })
  }
})

// Analyze image using OpenAI Vision API
async function analyzeImage(imageUrl, apiKey, context = {}) {
  
  // Add 1 second delay to prevent rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  try {
    const prompts = getPromptForAssetType('photo')
    
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
            content: prompts.systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompts.userInstruction(context)
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
        max_completion_tokens: 1000
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
      ai_raw: parsed, // Store the full parsed object
      ai_location: parsed.location || null // Extract location from caption processing
    };

    return finalResults

  } catch (error) {
    const prompts = getPromptForAssetType('photo')
    throw prompts.fallback
  }
}

// Analyze text content using OpenAI
async function analyzeText(text, apiKey, context = {}) {
  
  // Add 1 second delay to prevent rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  try {
    const prompts = getPromptForAssetType('text')
    
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
            content: prompts.systemPrompt
          },
          {
            role: 'user',
            content: prompts.userInstruction(context)
          }
        ],
        max_completion_tokens: 1000
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
      ai_raw: parsed,
      ai_location: parsed.location || null // Extract location from text processing
    };

    return finalResults

  } catch (error) {
    const prompts = getPromptForAssetType('text')
    throw prompts.fallback
  }
} 