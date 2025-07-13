// AI Photo Analysis endpoint
// Uses OpenAI Vision API to analyze photos and provide intelligent cropping suggestions

export default defineEventHandler(async (event) => {
  try {
    console.log('🤖 Starting AI photo analysis')
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
    const { imageUrl, targetShape, targetWidth, targetHeight } = body
    
    if (!imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image URL is required'
      })
    }
    
    console.log('📸 Analyzing image:', imageUrl)
    console.log('🎯 Target shape:', targetShape, 'Size:', targetWidth, 'x', targetHeight)
    
    // Download the image
    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to fetch image: ${imageRes.status}`
      })
    }
    
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
    const base64Image = imageBuffer.toString('base64')
    
    // Create prompt based on target shape
    let analysisPrompt
    switch (targetShape) {
      case 'round':
        analysisPrompt = `Analyze this photo and provide intelligent cropping suggestions for a circular crop. Focus on:
1. Main subject(s) - identify the primary subject(s) in the image
2. Composition - suggest the best center point for the circular crop
3. Zoom level - recommend how much to zoom/crop to frame the subject well
4. Background - consider what background elements to include/exclude

Respond with JSON format:
{
  "centerX": 0.5, // center point X (0-1, where 0.5 is middle)
  "centerY": 0.5, // center point Y (0-1, where 0.5 is middle)  
  "zoom": 1.2, // zoom factor (1.0 = no zoom, 1.2 = 20% zoom in)
  "reasoning": "explanation of the cropping decision"
}`
        break
        
      case 'oval':
        analysisPrompt = `Analyze this photo and provide intelligent cropping suggestions for an oval crop. Focus on:
1. Main subject(s) - identify the primary subject(s) in the image
2. Composition - suggest the best center point for the oval crop
3. Zoom level - recommend how much to zoom/crop to frame the subject well
4. Aspect ratio - consider the oval's aspect ratio for optimal framing

Respond with JSON format:
{
  "centerX": 0.5, // center point X (0-1, where 0.5 is middle)
  "centerY": 0.5, // center point Y (0-1, where 0.5 is middle)
  "zoom": 1.2, // zoom factor (1.0 = no zoom, 1.2 = 20% zoom in)
  "reasoning": "explanation of the cropping decision"
}`
        break
        
      default:
        analysisPrompt = `Analyze this photo and provide intelligent cropping suggestions. Focus on:
1. Main subject(s) - identify the primary subject(s) in the image
2. Composition - suggest the best center point for the crop
3. Zoom level - recommend how much to zoom/crop to frame the subject well

Respond with JSON format:
{
  "centerX": 0.5, // center point X (0-1, where 0.5 is middle)
  "centerY": 0.5, // center point Y (0-1, where 0.5 is middle)
  "zoom": 1.2, // zoom factor (1.0 = no zoom, 1.2 = 20% zoom in)
  "reasoning": "explanation of the cropping decision"
}`
    }
    
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
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
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
    
    console.log('🤖 AI Analysis response:', analysisText)
    
    // Parse the JSON response
    let analysis
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      // Return default values if parsing fails
      analysis = {
        centerX: 0.5,
        centerY: 0.5,
        zoom: 1.0,
        reasoning: 'Default values used due to parsing error'
      }
    }
    
    // Validate and clamp values
    analysis.centerX = Math.max(0, Math.min(1, analysis.centerX || 0.5))
    analysis.centerY = Math.max(0, Math.min(1, analysis.centerY || 0.5))
    analysis.zoom = Math.max(0.5, Math.min(3, analysis.zoom || 1.0))
    
    // Apply 20% zoom out to give better fit in shapes
    analysis.zoom = Math.max(0.5, analysis.zoom * 0.8)
    
    // Check if subject is in a corner and adjust cropping
    const cornerThreshold = 0.2 // Consider "corner" if within 20% of edge
    const isNearLeft = analysis.centerX < cornerThreshold
    const isNearRight = analysis.centerX > (1 - cornerThreshold)
    const isNearTop = analysis.centerY < cornerThreshold
    const isNearBottom = analysis.centerY > (1 - cornerThreshold)
    
    if (isNearLeft || isNearRight || isNearTop || isNearBottom) {
      console.log('📍 Subject detected near corner/edge, applying corner-safe cropping')
      
      // If subject is in corner, use more conservative zoom to preserve the corner
      if (analysis.zoom > 1.0) {
        analysis.zoom = Math.max(0.8, analysis.zoom * 0.7) // Additional 30% zoom out for corners
        console.log('🔍 Applied corner-safe zoom out. Final zoom:', analysis.zoom)
      }
      
      // Adjust center point to ensure corner is preserved
      if (isNearLeft) {
        analysis.centerX = Math.max(0.1, analysis.centerX) // Keep some margin from left edge
      }
      if (isNearRight) {
        analysis.centerX = Math.min(0.9, analysis.centerX) // Keep some margin from right edge
      }
      if (isNearTop) {
        analysis.centerY = Math.max(0.1, analysis.centerY) // Keep some margin from top edge
      }
      if (isNearBottom) {
        analysis.centerY = Math.min(0.9, analysis.centerY) // Keep some margin from bottom edge
      }
      
      console.log('📍 Adjusted center point for corner safety:', { centerX: analysis.centerX, centerY: analysis.centerY })
    }
    
    console.log('🔍 Applied 20% zoom out. Final zoom:', analysis.zoom)
    
    console.log('✅ AI analysis completed:', analysis)
    
    return {
      success: true,
      analysis: analysis
    }
    
  } catch (error) {
    console.error('❌ AI photo analysis error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `AI photo analysis failed: ${error.message}`
    })
  }
}) 