// Uses OpenAI Vision API to detect faces in images and return their locations

export default defineEventHandler(async (event) => {
  try {
    console.log('👥 Starting face detection endpoint')
    const config = useRuntimeConfig()
    
    // Get OpenAI API key
    const openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenAI API key not configured'
      })
    }
    
    // Get request body
    const body = await readBody(event)
    const { imageUrl } = body
    
    if (!imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image URL is required'
      })
    }
    
    console.log('🔍 Analyzing image for faces:', imageUrl)
    
    // Construct prompt for face detection
    const prompt = `DETECT ALL HUMAN FACES IN THIS IMAGE. RETURN ONLY A JSON OBJECT WITH THIS EXACT STRUCTURE:

{
  "faces": [
    {
      "x": 50,
      "y": 40,
      "width": 10,
      "height": 10,
      "confidence": 0.95
    }
  ],
  "total_faces": 1
}

WHERE:
- x, y are center coordinates as percentages (0-100)
- width, height are face dimensions as percentages (0-100)
- confidence is 0-1
- total_faces is the count

RETURN ONLY THE JSON. NO OTHER TEXT. NO EXPLANATIONS.`
    // Call OpenAI Vision API
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a face detection API. Respond with ONLY valid JSON. No explanations or text.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
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
        max_tokens: 500,
        temperature: 0.0
      })
    })
    
    if (!openaiRes.ok) {
      const errorText = await openaiRes.text()
      console.error('❌ OpenAI API error:', openaiRes.status, errorText)
      throw createError({
        statusCode: 500,
        statusMessage: `OpenAI API error: ${openaiRes.status}`
      })
    }
    
    const openaiData = await openaiRes.json()
    const analysisText = openaiData.choices[0].message.content
    
    console.log('🤖 OpenAI face detection response:', analysisText)
    
    // Parse the JSON response
    let faceData
    try {
      // Check if response is null or empty
      if (!analysisText || analysisText === 'null' || analysisText.trim() === '') {
        throw new Error('Empty or null response from OpenAI')
      }
      
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        faceData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('❌ Failed to parse face detection response:', parseError)
      console.log('🤖 Raw response was:', analysisText)
      // Return empty faces instead of throwing an error
      console.log('🔄 Returning empty faces for graceful fallback')
      return {
        success: true,
        faces: [],
        total_faces: 0
      }
    }
    
    console.log('✅ Face detection completed:', faceData)
    
    return {
      success: true,
      faces: faceData.faces || [],
      total_faces: faceData.total_faces || 0
    }
    
  } catch (error) {
    console.error('❌ Face detection error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Face detection failed'
    })
  }
}) 