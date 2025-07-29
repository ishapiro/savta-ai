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
    const prompt = `Analyze this image and identify all human faces. For each face detected, provide the following information in JSON format:

{
  "faces": [
    {
      "x": <center_x_as_percentage_0_to_100>,
      "y": <center_y_as_percentage_0_to_100>,
      "width": <face_width_as_percentage_0_to_100>,
      "height": <face_height_as_percentage_0_to_100>,
      "confidence": <confidence_score_0_to_1>
    }
  ],
  "total_faces": <number_of_faces_detected>
}

Important guidelines:
- x and y should be the center coordinates of the face
- width and height should be the face dimensions
- All coordinates should be percentages (0-100) relative to image dimensions
- If no faces are detected, return {"faces": [], "total_faces": 0}
- Be precise with face boundaries
- Include all visible faces, even partially visible ones
- Confidence should be between 0 and 1 (1 = very confident)`

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
        temperature: 0.1
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
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        faceData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('❌ Failed to parse face detection response:', parseError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to parse face detection response'
      })
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