// AI processing endpoint for assets
// Handles image analysis, caption generation, and tagging using OpenAI

export default defineEventHandler(async (event) => {
  console.log('🚀 AI processing endpoint called')
  
  try {
    const body = await readBody(event)
    const { assetId, assetType, storageUrl, userCaption } = body

    console.log('📥 Request body:', {
      assetId,
      assetType,
      hasStorageUrl: !!storageUrl,
      hasUserCaption: !!userCaption
    })

    if (!assetId || !assetType) {
      console.error('❌ Missing required fields:', { assetId, assetType })
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: assetId, assetType'
      })
    }

    // Validate asset ID format
    console.log('🔍 Validating asset ID:', assetId)
    if (typeof assetId !== 'string' || assetId.length < 10) {
      console.error('❌ Invalid asset ID format:', assetId)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid asset ID format'
      })
    }

    const config = useRuntimeConfig()
    const openaiApiKey = config.openaiApiKey

    console.log('🔑 OpenAI API key configured:', !!openaiApiKey)

    // Check if OpenAI API key is configured
    if (!openaiApiKey) {
      console.warn('⚠️ OpenAI API key not configured - using fallback processing')
      
      // Use fallback processing without AI
      const fallbackResults = {
        ai_caption: assetType === 'photo' 
          ? 'A beautiful family moment captured forever.' 
          : 'A precious family story to cherish.',
        tags: assetType === 'photo' ? ['family', 'memory'] : ['family', 'story'],
        people_detected: [],
        ai_processed: true
      }

      console.log('🔄 Using fallback results:', fallbackResults)

      // Update asset with fallback results
      console.log('💾 Starting database update for fallback...')
      console.log('📊 Fallback results to update:', fallbackResults)
      console.log('🆔 Asset ID:', assetId)
      
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabase = createClient(
        config.public.supabaseUrl,
        config.public.supabaseKey
      )
      
      console.log('🔗 Supabase client created')
      console.log('🌐 Supabase URL:', config.public.supabaseUrl)
      console.log('🔑 Supabase key configured:', !!config.public.supabaseKey)
      
      try {
        // First, check if the asset exists
        console.log('🔍 Checking if asset exists (fallback)...')
        const { data: existingAsset, error: checkError } = await supabase
          .from('assets')
          .select('id, user_id')
          .eq('id', assetId)
          .single()

        if (checkError) {
          console.error('❌ Asset check error (fallback):', checkError)
          throw createError({
            statusCode: 404,
            statusMessage: `Asset not found: ${assetId}`
          })
        }

        console.log('✅ Asset found (fallback):', existingAsset)

        // Now update the asset
        const { data, error } = await supabase
          .from('assets')
          .update(fallbackResults)
          .eq('id', assetId)
          .select()
          .single()

        if (error) {
          console.error('❌ Supabase error details (fallback):', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          })
          throw createError({
            statusCode: 500,
            statusMessage: `Failed to update asset with fallback results: ${error.message}`
          })
        }

        console.log('✅ Database update successful (fallback):', data)
      } catch (dbError) {
        console.error('💥 Database update exception (fallback):', dbError)
        throw createError({
          statusCode: 500,
          statusMessage: `Database update failed: ${dbError.message}`
        })
      }

      console.log('✅ Asset updated successfully with fallback results')

      return {
        success: true,
        data,
        aiResults: fallbackResults,
        message: 'Processed with fallback (OpenAI API key not configured)'
      }
    }

    console.log('🤖 Starting AI processing for asset type:', assetType)

    let aiResults = {
      ai_caption: '',
      tags: [],
      people_detected: [],
      ai_processed: true
    }

    if (assetType === 'photo' && storageUrl) {
      console.log('📸 Processing photo with OpenAI Vision API...')
      // Process image with OpenAI Vision API
      const imageAnalysis = await analyzeImage(storageUrl, openaiApiKey)
      aiResults = {
        ...aiResults,
        ...imageAnalysis
      }
      console.log('📸 Photo analysis completed:', imageAnalysis)
    } else if (assetType === 'text' && userCaption) {
      console.log('📝 Processing text content with OpenAI...')
      // Process text content
      const textAnalysis = await analyzeText(userCaption, openaiApiKey)
      aiResults = {
        ...aiResults,
        ...textAnalysis
      }
      console.log('📝 Text analysis completed:', textAnalysis)
    } else {
      console.log('⚠️ Missing data for AI processing, using fallback...')
      // Fallback for missing data
      aiResults = {
        ai_caption: assetType === 'photo' 
          ? 'A beautiful family moment captured forever.' 
          : 'A precious family story to cherish.',
        tags: assetType === 'photo' ? ['family', 'memory'] : ['family', 'story'],
        people_detected: [],
        ai_processed: true
      }
      console.log('🔄 Fallback results:', aiResults)
    }

    console.log('💾 Updating asset with AI results...')

    // Update asset with AI results
    console.log('💾 Starting database update...')
    console.log('📊 AI results to update:', aiResults)
    console.log('🆔 Asset ID:', assetId)
    
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
    
    console.log('🔗 Supabase client created')
    console.log('🌐 Supabase URL:', config.public.supabaseUrl)
    console.log('🔑 Supabase key configured:', !!config.public.supabaseKey)
    
    let updatedAsset = null;
    let aiUpdate = null;
      
      try {
        // First, check if the asset exists
        console.log('🔍 Checking if asset exists...')
        console.log('🆔 Looking for asset ID:', assetId)
        
        // Add a small delay to ensure the asset has been created
        console.log('⏳ Waiting 1 second for asset to be created...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: existingAsset, error: checkError } = await supabase
          .from('assets')
          .select('id, user_id')
          .eq('id', assetId)
          .single()

        console.log('🔍 Asset check result:', { existingAsset, checkError })

        if (checkError) {
          console.error('❌ Asset check error:', checkError)
          throw createError({
            statusCode: 404,
            statusMessage: `Asset not found: ${assetId}`
          })
        }

        console.log('✅ Asset found:', existingAsset)

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
          console.error('❌ Supabase error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          })
          throw createError({
            statusCode: 500,
            statusMessage: `Failed to update asset with AI results: ${error.message}`
          })
        }

        updatedAsset = data
        console.log('✅ Database update successful:', updatedAsset)
      } catch (dbError) {
        console.error('💥 Database update exception:', dbError)
        throw createError({
          statusCode: 500,
          statusMessage: `Database update failed: ${dbError.message}`
        })
      }

    console.log('✅ Asset updated successfully with AI results')

    return {
      success: true,
      data: updatedAsset,
      aiResults: aiUpdate
    }

  } catch (error) {
    console.error('💥 AI processing error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'AI processing failed'
    })
  }
})

// Analyze image using OpenAI Vision API
async function analyzeImage(imageUrl, apiKey) {
  console.log('🔍 Starting image analysis for URL:', imageUrl)
  
  try {
    console.log('📡 Making OpenAI API request...')
    
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

    console.log('📡 OpenAI API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    console.log('📄 Raw OpenAI response:', content)

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
      console.log('✅ Successfully parsed OpenAI JSON response');
    } catch (e) {
      console.warn('⚠️ Failed to parse OpenAI JSON response:', e);
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

    console.log('✅ Image analysis completed successfully:', finalResults)
    return finalResults

  } catch (error) {
    console.error('❌ Image analysis error:', error)
    return {
      ai_caption: 'A beautiful family moment captured forever.',
      tags: ['family', 'memory'],
      people_detected: []
    }
  }
}

// Analyze text content using OpenAI
async function analyzeText(text, apiKey) {
  console.log('🔍 Starting text analysis for:', text.substring(0, 50) + '...')
  
  try {
    console.log('📡 Making OpenAI API request for text analysis...')
    
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

    console.log('📡 OpenAI API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    console.log('📄 Raw OpenAI response:', content)

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
      console.log('✅ Successfully parsed OpenAI JSON response');
    } catch (e) {
      console.warn('⚠️ Failed to parse OpenAI JSON response:', e);
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

    console.log('✅ Text analysis completed successfully:', finalResults)
    return finalResults

  } catch (error) {
    console.error('❌ Text analysis error:', error)
    return {
      ai_caption: 'A precious family story to cherish.',
      tags: ['family', 'story'],
      people_detected: []
    }
  }
} 