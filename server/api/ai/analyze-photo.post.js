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
    
    // Create a comprehensive shape analysis prompt
    const analysisPrompt = `Analyze this photo and determine which shape will work best for optimal framing. Consider all available shapes: original, square, round, oval.

1. SHAPE COMPARISON ANALYSIS:
   - Original: Keep natural aspect ratio, minimal cropping
   - Square: Force 1:1 aspect ratio, may crop significantly
   - Round: Circular crop, works best for centered subjects
   - Oval: Elliptical crop, good for wider subjects

2. SUBJECT ASSESSMENT:
   - What is the main subject(s) in the image?
   - What is the subject's natural shape and orientation?
   - Are there important elements that shouldn't be cut off?
   - How is the subject positioned (centered, off-center, near edges)?

3. COMPOSITION ANALYSIS:
   - Which shape would frame the subject most naturally?
   - What would be the optimal center point for round/oval shapes?
   - What zoom level would work best for the recommended shape?

4. RECOMMENDATION:
   - Rank the shapes from best to worst for this image
   - Provide specific cropping parameters for the best shape
   - Explain why this shape works best

Respond with JSON format:
{
  "bestShape": "original|square|round|oval", // the shape that works best
  "shapeRanking": ["best", "second", "third", "worst"], // ranking of all shapes
  "willFit": true, // boolean - whether the best shape will work well
  "fitQuality": "excellent|good|fair|poor", // how well the best shape fits
  "centerX": 0.5, // center point X for round/oval (0-1, where 0.5 is middle)
  "centerY": 0.5, // center point Y for round/oval (0-1, where 0.5 is middle)
  "zoom": 1.2, // zoom factor (1.0 = no zoom, 1.2 = 20% zoom in)
  "reasoning": "detailed explanation of shape analysis and recommendations",
  "shapeAnalysis": {
    "original": "explanation of how original shape would work",
    "square": "explanation of how square shape would work", 
    "round": "explanation of how round shape would work",
    "oval": "explanation of how oval shape would work"
  }
}`
    
    // Call OpenAI Vision API
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5',
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
        max_completion_tokens: 5000
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
        willFit: true,
        fitQuality: 'fair',
        centerX: 0.5,
        centerY: 0.5,
        zoom: 1.0,
        reasoning: 'Default values used due to parsing error',
        alternativeShape: 'original'
      }
    }
    
    // Set default values for new fields if not present
    analysis.bestShape = analysis.bestShape || 'original'
    analysis.shapeRanking = analysis.shapeRanking || ['original', 'square', 'round', 'oval']
    analysis.willFit = analysis.willFit !== undefined ? analysis.willFit : true
    analysis.fitQuality = analysis.fitQuality || 'fair'
    analysis.shapeAnalysis = analysis.shapeAnalysis || {
      original: 'Default analysis',
      square: 'Default analysis',
      round: 'Default analysis',
      oval: 'Default analysis'
    }
    
    // Validate and clamp values
    analysis.centerX = Math.max(0, Math.min(1, analysis.centerX || 0.5))
    analysis.centerY = Math.max(0, Math.min(1, analysis.centerY || 0.5))
    analysis.zoom = Math.max(0.5, Math.min(3, analysis.zoom || 1.0))
    
    // Apply more aggressive zoom out to ensure subject is always in shape
    analysis.zoom = Math.max(0.5, analysis.zoom * 0.6) // 40% zoom out instead of 20%
    
    // Check if subject is more than 20% off center and apply aggressive containment
    const centerThreshold = 0.3 // Consider "off center" if more than 30% from center
    const distanceFromCenter = Math.sqrt(
      Math.pow(analysis.centerX - 0.5, 2) + 
      Math.pow(analysis.centerY - 0.5, 2)
    )
    
    const isOffCenter = distanceFromCenter > centerThreshold
    const cornerThreshold = 0.2 // Consider "corner" if within 20% of edge
    const isNearLeft = analysis.centerX < cornerThreshold
    const isNearRight = analysis.centerX > (1 - cornerThreshold)
    const isNearTop = analysis.centerY < cornerThreshold
    const isNearBottom = analysis.centerY > (1 - cornerThreshold)
    
    if (isOffCenter || isNearLeft || isNearRight || isNearTop || isNearBottom) {
      console.log('📍 Subject detected off center or near corner/edge, applying aggressive containment')
      
      // Apply even more aggressive zoom out for off-center subjects
      if (isOffCenter) {
        analysis.zoom = Math.max(0.4, analysis.zoom * 0.5) // Additional 50% zoom out for off-center
        console.log('🔍 Applied off-center aggressive zoom out. Zoom:', analysis.zoom)
      }
      
      // If subject is in corner, use even more conservative zoom to preserve the corner
      if (isNearLeft || isNearRight || isNearTop || isNearBottom) {
        analysis.zoom = Math.max(0.3, analysis.zoom * 0.6) // Additional 40% zoom out for corners
        console.log('🔍 Applied corner-safe aggressive zoom out. Final zoom:', analysis.zoom)
      }
      
      // Adjust center point to ensure corner is preserved and subject stays in shape
      if (isNearLeft) {
        analysis.centerX = Math.max(0.15, analysis.centerX) // Keep more margin from left edge
      }
      if (isNearRight) {
        analysis.centerX = Math.min(0.85, analysis.centerX) // Keep more margin from right edge
      }
      if (isNearTop) {
        analysis.centerY = Math.max(0.15, analysis.centerY) // Keep more margin from top edge
      }
      if (isNearBottom) {
        analysis.centerY = Math.min(0.85, analysis.centerY) // Keep more margin from bottom edge
      }
      
      console.log('📍 Adjusted center point for aggressive containment:', { centerX: analysis.centerX, centerY: analysis.centerY })
    }
    
    console.log('🔍 Applied aggressive zoom out. Final zoom:', analysis.zoom)
    
    // Log shape analysis results
    console.log('📊 Shape Analysis:', {
      bestShape: analysis.bestShape,
      shapeRanking: analysis.shapeRanking,
      willFit: analysis.willFit,
      fitQuality: analysis.fitQuality
    })
    
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