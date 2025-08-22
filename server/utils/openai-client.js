/**
 * Centralized OpenAI client for the Savta AI application
 * Handles all OpenAI API calls using the Responses API format
 */

// Load environment variables
import dotenv from 'dotenv';
import exifr from 'exifr';
dotenv.config({ quiet: true });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

/**
 * Make a request to OpenAI's Responses API
 * @param {Object} payload - The API payload
 * @returns {Promise<Object>} The API response
 */
async function makeOpenAIRequest(payload) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Add timeout configuration - increased for larger photo selection requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for large requests

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error Response:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('OpenAI API request timed out after 5 minutes');
    }
    
    // Check if it's a timeout error from OpenAI
    if (error.message && error.message.includes('Timeout while downloading')) {
      console.error('❌ Image download timeout detected. This usually means the image URL is not accessible or the image is too large.');
      throw new Error('Image download timeout - please check that your images are accessible and not too large');
    }
    
    throw error;
  }
}

/**
 * Parse OpenAI response to extract JSON content
 * @param {Object} openaiData - The raw OpenAI response
 * @returns {Object|null} The parsed JSON content or null if not found
 */
function parseOpenAIResponse(openaiData) {
  // Try to get JSON directly from the structured output
  let jsonContent = openaiData.output?.[0]?.content?.[0]?.json;
  
  if (jsonContent) {
    console.log('✅ OpenAI API result:', jsonContent);
    return jsonContent;
  }

  // Fallback: try to parse from output_text
  const outputText = openaiData.output?.[0]?.content?.[0]?.text;
  if (outputText) {
    try {
      const parsed = JSON.parse(outputText);
      console.log('✅ OpenAI API result:', parsed);
      return parsed;
    } catch (e) {
      console.warn('⚠️ Failed to parse JSON from output_text:', e);
    }
  }

  // Additional fallback: check if the entire response is the JSON
  if (openaiData.output && Array.isArray(openaiData.output) && openaiData.output.length > 0) {
    for (let i = 0; i < openaiData.output.length; i++) {
      const output = openaiData.output[i];
      if (output.content && Array.isArray(output.content)) {
        for (let j = 0; j < output.content.length; j++) {
          const content = output.content[j];
          
          if (content.json) {
            console.log('✅ OpenAI API result:', content.json);
            return content.json;
          }
          
          if (content.text) {
            try {
              const parsed = JSON.parse(content.text);
              console.log('✅ OpenAI API result:', parsed);
              return parsed;
            } catch (e) {
              console.warn('⚠️ Failed to parse JSON from content text:', e);
            }
          }
        }
      }
    }
  }

  console.warn('❌ No JSON content found in OpenAI response');
  return null;
}

/**
 * AI-powered smart cropping recommendation function
 * @param {string} imageUrl - The URL of the image to analyze
 * @param {number} targetWidth - The target width for the crop
 * @param {number} targetHeight - The target height for the crop
 * @returns {Promise<Object>} The crop recommendation with optimal crop area
 */
async function aiCropRecommendation(imageUrl, targetWidth, targetHeight) {
  // Validate the image URL before sending to OpenAI
  const isValid = await validateImageUrl(imageUrl);
  if (!isValid) {
    throw new Error(`Image URL is not accessible: ${imageUrl}`);
  }
  
  const payload = {
    model: 'gpt-4o',
    instructions: 'You are an expert image cropping specialist. Analyze the image and recommend the optimal crop area that prioritizes important subjects while maintaining good composition. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'crop_recommendation',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            image: {
              type: 'object',
              additionalProperties: false,
              properties: {
                width_px: { type: 'integer', minimum: 1 },
                height_px: { type: 'integer', minimum: 1 }
              },
              required: ['width_px', 'height_px']
            },
            crop_area: {
              type: 'object',
              additionalProperties: false,
              properties: {
                x: { type: 'number', minimum: 0, maximum: 1 },
                y: { type: 'number', minimum: 0, maximum: 1 },
                width: { type: 'number', minimum: 0, maximum: 1 },
                height: { type: 'number', minimum: 0, maximum: 1 }
              },
              required: ['x', 'y', 'width', 'height']
            },
            priority_subjects: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  type: { type: 'string', enum: ['face', 'person', 'animal', 'object'] },
                  confidence: { type: 'number', minimum: 0, maximum: 1 },
                  bbox: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      x: { type: 'number', minimum: 0, maximum: 1 },
                      y: { type: 'number', minimum: 0, maximum: 1 },
                      width: { type: 'number', minimum: 0, maximum: 1 },
                      height: { type: 'number', minimum: 0, maximum: 1 }
                    },
                    required: ['x', 'y', 'width', 'height']
                  }
                },
                required: ['type', 'confidence', 'bbox']
              }
            },
            reasoning: { type: 'string' },
            confidence: { type: 'number', minimum: 0, maximum: 1 }
          },
          required: ['image', 'crop_area', 'priority_subjects', 'reasoning', 'confidence']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Analyze this image and recommend the optimal crop area to fit dimensions ${targetWidth}x${targetHeight}. 

PRIORITY ORDER (most important first):
1. NEVER cut off faces - faces are the most important subjects
2. Avoid cutting off people - include full bodies when possible
3. Preserve animals - include complete animals when present
4. Maintain good composition - follow rule of thirds, avoid awkward crops

CROP GUIDELINES:
- The crop_area should maintain the target aspect ratio of ${targetWidth}:${targetHeight}
- Use normalized [0..1] coordinates with origin at top-left
- Include the most visually important parts of the image
- Center on faces if present, otherwise on the main subject
- Avoid cutting off important elements at the edges
- Consider the overall composition and visual balance

Return a detailed analysis including:
- The recommended crop area coordinates
- List of priority subjects found (faces, people, animals, objects)
- Reasoning for the crop decision
- Confidence level in the recommendation`
          },
          {
            type: 'input_image',
            image_url: imageUrl
          }
        ]
      }
    ],
    max_output_tokens: 10000
  };

  const response = await makeOpenAIRequest(payload);
  return parseOpenAIResponse(response);
}

/**
 * Validate that an image URL is accessible
 * @param {string} imageUrl - The URL to validate
 * @returns {Promise<boolean>} Whether the URL is accessible
 */
async function validateImageUrl(imageUrl) {
  try {
;
    
    // Basic URL validation
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.warn(`⚠️ Invalid image URL: ${imageUrl}`);
      return false;
    }
    
    // Check if URL is properly formatted
    try {
      new URL(imageUrl);
    } catch (e) {
      console.warn(`⚠️ Malformed image URL: ${imageUrl}`);
      return false;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(imageUrl, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`⚠️ Image URL not accessible: ${imageUrl} (Status: ${response.status})`);
      return false;
    }
    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
;
    
    if (!contentType || !contentType.startsWith('image/')) {
      console.warn(`⚠️ URL does not point to an image: ${imageUrl} (Content-Type: ${contentType})`);
      return false;
    }
    
    // Check if image is too large (over 20MB)
    if (contentLength && parseInt(contentLength) > 20 * 1024 * 1024) {
      console.warn(`⚠️ Image too large: ${imageUrl} (Size: ${contentLength} bytes)`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn(`⚠️ Failed to validate image URL ${imageUrl}:`, error.message);
    return false;
  }
}

/**
 * Create a photo selection request
 * @param {Array} photoUrls - Array of photo URLs or photo objects
 * @returns {Promise<Object>} The photo selection results
 */
async function selectPhotos(photoUrls, photoCount = null) {
  // Handle both URL strings and photo objects with URLs
  const validPhotos = [];
  const photoInputs = [];
  
  for (let i = 0; i < photoUrls.length; i++) {
    const photo = photoUrls[i];
    const imageUrl = typeof photo === 'string' ? photo : photo.storage_url || photo.asset_url || photo.url;
    
    // Validate the image URL before adding it
    const isValid = await validateImageUrl(imageUrl);
    if (isValid) {
      validPhotos.push(photo);
      photoInputs.push({
        type: 'input_image',
        image_url: imageUrl
      });
    } else {
      console.warn(`⚠️ Skipping invalid image URL: ${imageUrl}`);
    }
  }
  
  if (validPhotos.length === 0) {
    throw new Error('No valid image URLs found. Please check that your images are accessible.');
  }
  
  console.log(`✅ Validated ${validPhotos.length} out of ${photoUrls.length} images`);

  // Determine how many photos to select
  const targetCount = photoCount || Math.min(3, validPhotos.length);

  const payload = {
    model: 'gpt-4o',
    instructions: 'You are a warm, caring grandmother selecting meaningful family photos. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'photo_selection',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            selected_photo_numbers: {
              type: 'array',
              items: {
                type: 'integer',
                minimum: 1
              },
              description: `Array of exactly ${targetCount} photo numbers (1, 2, 3, etc.) selected from the provided pool`
            }
          },
          required: ['selected_photo_numbers']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Select exactly ${targetCount} of the most meaningful and visually appealing photos from this collection of ${validPhotos.length} family photos. Choose photos that tell a story together and would make a beautiful memory book. You must select exactly ${targetCount} photos. Return ONLY JSON with the selected photo numbers.`
          },
          ...photoInputs
        ]
      }
    ],
    max_output_tokens: 10000
  };

  const response = await makeOpenAIRequest(payload);
  const result = parseOpenAIResponse(response);
  
  // Map the selected photo numbers back to the original photo array indices
  if (result && result.selected_photo_numbers) {
    // Create a mapping from valid photos back to original indices
    const originalIndices = [];
    for (let i = 0; i < photoUrls.length; i++) {
      const photo = photoUrls[i];
      const imageUrl = typeof photo === 'string' ? photo : photo.storage_url || photo.asset_url || photo.url;
      
      // Find this URL in the valid photos
      const validIndex = validPhotos.findIndex(validPhoto => {
        const validUrl = typeof validPhoto === 'string' ? validPhoto : validPhoto.storage_url || validPhoto.asset_url || validPhoto.url;
        return validUrl === imageUrl;
      });
      
      if (validIndex !== -1) {
        originalIndices[validIndex] = i;
      }
    }
    
    // Convert selected photo numbers to original indices (0-based)
    result.selected_photo_numbers = result.selected_photo_numbers.map(num => originalIndices[num - 1]);
  }
  
  return result;
}

/**
 * Create a story generation request based on asset attributes
 * @param {Array} selectedAssets - Array of selected asset objects with attributes
 * @param {string} aiSupplementalPrompt - The memory book's AI supplemental prompt
 * @param {string|null} photoSelectionReasoning - The reasoning for why these photos were selected
 * @returns {Promise<Object>} The story generation results
 */
async function generateStoryFromAttributes(selectedAssets, aiSupplementalPrompt, photoSelectionReasoning = null) {
  console.log('📝 STEP 2: STORY GENERATION - generateStoryFromAttributes function called')
  console.log('📝 STEP 2: STORY GENERATION - Function parameters:', {
    selectedAssetsCount: selectedAssets?.length || 0,
    aiSupplementalPrompt: aiSupplementalPrompt || 'none',
    photoSelectionReasoning: photoSelectionReasoning || 'none'
  })
  
  if (!selectedAssets || selectedAssets.length === 0) {
    console.error('❌ STEP 2: STORY GENERATION - No assets provided for story generation')
    throw new Error('No assets provided for story generation');
  }
  
  console.log(`📝 STEP 2: STORY GENERATION - Generating story from ${selectedAssets.length} selected assets`);

  // Create asset data for the prompt
  const assetData = selectedAssets.map((asset, index) => `
Photo ${index + 1}:
- Title: ${asset.title || 'Untitled'}
- AI Caption: ${asset.ai_caption || 'No AI caption'}
- AI Description: ${asset.ai_description || 'No AI description'}
- User Caption: ${asset.user_caption || 'No user caption'}
- Tags: ${asset.tags || 'No tags'}
- User Tags: ${asset.user_tags || 'No user tags'}
- People: ${asset.user_people || 'No people identified'}
- Location: ${asset.city}${asset.state ? ', ' + asset.state : ''}${asset.country ? ', ' + asset.country : ''}
- Date: ${asset.asset_date || 'No date'}
`).join('\n');

  const payload = {
    model: 'gpt-4o',
    instructions: 'You are a warm, caring grandmother. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'story_response',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            story: {
              type: 'string',
              description: 'A 1-2 sentence caption that connects the selected photos into a cohesive narrative'
            }
          },
          required: ['story']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Based on the following ${selectedAssets.length} photos and the memory book theme "${aiSupplementalPrompt}", generate a concise, engaging, and creative caption (max 2-3 sentences) that tells a story about these photos. The caption should be based ONLY on the provided photo attributes and should not invent details. Focus on creating a cohesive narrative that ties the photos together.

${photoSelectionReasoning ? `PHOTO SELECTION REASONING: ${photoSelectionReasoning}

This reasoning explains why these specific photos were chosen for your memory book. Use this context to help create a more meaningful and connected story.` : ''}

CRITICAL REQUIREMENTS:
- Keep it SHORT: 2-3 sentences maximum
- Make it personal and touching, like something a grandmother would write
- The caption can be funny but not sarcastic
- Make it meaningful and create a beautiful narrative
- Use an 8th grade reading level
- Use modern language
- Use simple grammar
- The prose can be sentimental or nostalgic but not sappy
- The prose can be happy but not cheesy
- Shorter is better than longer
- Focus on the people, places, and moments shown in the photos
- Connect the photos into a cohesive story
- Base the story on the memory book theme: "${aiSupplementalPrompt}"
${photoSelectionReasoning ? '- Consider the photo selection reasoning when crafting your story' : ''}

LOCATION RULES:
- ONLY mention specific cities, states, or countries that are actually shown in the photo locations
- If photos show "Unknown location" or no specific location, do NOT invent or assume locations
- If the user prompt mentions a city but the photos don't show that city, do NOT include that city name in the story
- Use generic terms like "our special day" or "this beautiful moment" instead of specific locations when photos don't show them
- The story should be based on what the photos actually show, not what the user prompt suggests

Here are the selected photos:

${assetData}

Return ONLY JSON with the story.`
          }
        ]
      }
    ],
    max_output_tokens: 2500
  };

  console.log('📝 STEP 2: STORY GENERATION - Making OpenAI request')
  const response = await makeOpenAIRequest(payload);
  console.log('📝 STEP 2: STORY GENERATION - OpenAI response received')
  
  const result = parseOpenAIResponse(response);
  console.log('📝 STEP 2: STORY GENERATION - Response parsed successfully')
  
  return result;
}

/**
 * Create a story generation request (legacy function for backward compatibility)
 * @param {Array} selectedPhotoUrls - Array of selected photo URLs
 * @returns {Promise<Object>} The story generation results
 */
async function generateStory(selectedPhotoUrls) {
  // Validate all photo URLs before sending to OpenAI
  const validPhotoInputs = [];
  
  for (const url of selectedPhotoUrls) {
    const imageUrl = typeof url === 'string' ? url : url.storage_url || url.asset_url || url.url;
    
    const isValid = await validateImageUrl(imageUrl);
    if (isValid) {
      validPhotoInputs.push({
        type: 'input_image',
        image_url: imageUrl
      });
    } else {
      console.warn(`⚠️ Skipping invalid image URL in story generation: ${imageUrl}`);
    }
  }
  
  if (validPhotoInputs.length === 0) {
    throw new Error('No valid image URLs found for story generation. Please check that your images are accessible.');
  }
  
  console.log(`✅ Using ${validPhotoInputs.length} valid images for story generation`);

  const payload = {
    model: 'gpt-5',
    instructions: 'You are a warm, caring grandmother. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'story_response',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            story: {
              type: 'string',
              description: 'A 1-2 sentence story that connects the selected photos into a cohesive narrative'
            }
          },
          required: ['story']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Create a warm, 1-2 sentence, funny, and meaningful caption that connects these family 
            photos into a beautiful narrative. 
            Make it personal and touching, like something a grandmother would write. 
            The caption can be funny but not sarcastic.
            Use an 8th grade reading level. 
            Use modern language.  
            Use simple grammar.
            The prose can be sentimental or nostalgic but not sappy.
            The prose can be happy but not cheesy. 
            Shorter is better than longer.
            
            LOCATION RULES:
            - ONLY mention specific cities, states, or countries that are actually visible in the photos
            - If you cannot see specific locations in the photos, do NOT invent or assume locations
            - If the user prompt mentions a city but the photos don't show that city, do NOT include that city name in the story
            - Use generic terms like "our special day" or "this beautiful moment" instead of specific locations
            - The story should be based on what the photos actually show, not assumptions
            
            Return ONLY JSON with the story.`
          },
          ...validPhotoInputs
        ]
      }
    ],
    max_output_tokens: 10000
  };

  const response = await makeOpenAIRequest(payload);
  return parseOpenAIResponse(response);
}

/**
 * Create a photo analysis request for shape optimization
 * @param {string} imageUrl - The URL of the image to analyze
 * @returns {Promise<Object>} The photo analysis results
 */
async function analyzePhotoShape(imageUrl) {
  // Validate the image URL before sending to OpenAI
  const isValid = await validateImageUrl(imageUrl);
  if (!isValid) {
    throw new Error(`Image URL is not accessible: ${imageUrl}`);
  }
  
  const payload = {
    model: 'gpt-4o',
    instructions: 'You are a precise image analysis tool. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'shape_analysis',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            bestShape: {
              type: 'string',
              enum: ['original', 'square', 'round', 'oval']
            },
            shapeRanking: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['original', 'square', 'round', 'oval']
              },
              minItems: 4,
              maxItems: 4
            },
            willFit: {
              type: 'boolean'
            },
            fitQuality: {
              type: 'string',
              enum: ['excellent', 'good', 'fair', 'poor']
            },
            centerX: {
              type: 'number',
              minimum: 0,
              maximum: 1
            },
            centerY: {
              type: 'number',
              minimum: 0,
              maximum: 1
            },
            zoom: {
              type: 'number',
              minimum: 0.5,
              maximum: 3
            },
            reasoning: {
              type: 'string'
            },
            shapeAnalysis: {
              type: 'object',
              properties: {
                original: { type: 'string' },
                square: { type: 'string' },
                round: { type: 'string' },
                oval: { type: 'string' }
              },
              required: ['original', 'square', 'round', 'oval']
            }
          },
          required: ['bestShape', 'shapeRanking', 'willFit', 'fitQuality', 'centerX', 'centerY', 'zoom', 'reasoning', 'shapeAnalysis']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Analyze this photo for optimal shape and cropping. Consider the composition, subject placement, and how it would look in different shapes (original, square, round, oval). Return ONLY JSON with the analysis.'
          },
          {
            type: 'input_image',
            image_url: imageUrl
          }
        ]
      }
    ],
    max_output_tokens: 10000
  };

  const response = await makeOpenAIRequest(payload);
  return parseOpenAIResponse(response);
}

/**
 * Create an image analysis request for captions and tags
 * @param {string} imageUrl - The URL of the image to analyze
 * @returns {Promise<Object>} The image analysis results
 */
async function analyzeImage(imageUrl) {
  // Validate the image URL before sending to OpenAI
  const isValid = await validateImageUrl(imageUrl);
  if (!isValid) {
    throw new Error(`Image URL is not accessible: ${imageUrl}`);
  }
  
  // Extract EXIF data before sending to AI
  console.log('🔍 Extracting EXIF data from image:', imageUrl);
  let exifData = null;
  
  try {
    // Use exifr library to extract EXIF data
    const exifResult = await exifr.parse(imageUrl, {
      gps: true,
      exif: true,
      ifd0: true,
      ifd1: true,
      iptc: true,
      xmp: true,
      icc: true,
      ihdr: true,
      thumb: false,
      tiff: true,
      jfif: true,
      sof: true,
      sof2: true,
      sof3: true,
      sof5: true,
      sof6: true,
      sof7: true,
      sof9: true,
      sof10: true,
      sof11: true,
      sof13: true,
      sof14: true,
      sof15: true
    });
    
    if (exifResult) {
      console.log('✅ EXIF data extracted successfully');
              exifData = {
          has_exif: true,
          extracted_at: new Date().toISOString(),
          gps_latitude: exifResult.latitude || null,
          gps_longitude: exifResult.longitude || null,
          date_taken: exifResult.DateTimeOriginal || exifResult.DateTime || exifResult.CreateDate || null,
          camera_make: exifResult.Make || null,
          camera_model: exifResult.Model || null,
          original_width: exifResult.ImageWidth || exifResult.ExifImageWidth || null,
          original_height: exifResult.ImageHeight || exifResult.ExifImageHeight || null,
          orientation: exifResult.Orientation || null,
          software: exifResult.Software || null,
          artist: exifResult.Artist || null,
          copyright: exifResult.Copyright || null
        };
      
      // Log key EXIF fields
      if (exifResult.latitude && exifResult.longitude) {
        console.log(`📍 GPS Coordinates: ${exifResult.latitude}, ${exifResult.longitude}`);
      }
      if (exifResult.DateTimeOriginal) {
        console.log(`📅 Date Taken: ${exifResult.DateTimeOriginal}`);
      }
      if (exifResult.Make && exifResult.Model) {
        console.log(`📷 Camera: ${exifResult.Make} ${exifResult.Model}`);
      }
    } else {
      console.log('❌ No EXIF data found in image');
      exifData = {
        has_exif: false,
        extracted_at: new Date().toISOString()
      };
    }
  } catch (exifError) {
    console.warn('⚠️ Error extracting EXIF data:', exifError.message);
    exifData = {
      error: exifError.message,
      extracted_at: new Date().toISOString()
    };
  }
  
          console.log('📊 EXIF extraction summary:', {
          has_exif: exifData.has_exif,
          gps_latitude: exifData.gps_latitude,
          gps_longitude: exifData.gps_longitude,
          date_taken: exifData.date_taken,
          camera_make: exifData.camera_make,
          camera_model: exifData.camera_model,
          original_width: exifData.original_width,
          original_height: exifData.original_height
        });
  
  const payload = {
    model: 'gpt-4o',
    instructions: 'You are a hip grandmother with precise image analysis skills. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'image_analysis',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            caption: {
              type: 'string',
              description: 'A descriptive caption for the image'
            },
            ai_description: {
              type: 'string',
              description: 'A comprehensive overall description of the image that captures all the key elements, people, objects, setting, and context'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Relevant tags for the image'
            },
            people_detected: {
              type: 'array',
              items: { type: 'string' },
              description: 'Names of people detected in the image'
            },
            objects: {
              type: 'array',
              items: { type: 'string' },
              description: 'Objects detected in the image'
            },
            location: {
              type: 'string',
              description: 'Location information if visible in the image'
            },
            exif_data: {
              type: 'object',
              additionalProperties: false,
              description: 'Raw EXIF metadata from the image including GPS coordinates, date, camera info, etc.',
              properties: {
                gps_latitude: { type: 'number', description: 'GPS latitude if available' },
                gps_longitude: { type: 'number', description: 'GPS longitude if available' },
                date_taken: { type: 'string', description: 'Date and time photo was taken' },
                camera_make: { type: 'string', description: 'Camera manufacturer' },
                camera_model: { type: 'string', description: 'Camera model' },
                original_width: { type: 'number', description: 'Original image width' },
                original_height: { type: 'number', description: 'Original image height' }
              },
              required: ['gps_latitude', 'gps_longitude', 'date_taken', 'camera_make', 'camera_model', 'original_width', 'original_height']
            }
          },
          required: ['caption', 'ai_description', 'tags', 'people_detected', 'objects', 'location', 'exif_data']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Analyze this image and provide a caption, comprehensive description, tags, detected people, objects, location information, and EXIF metadata.
            Return ONLY JSON with the analysis.
            
            PRE-EXTRACTED EXIF DATA (use this exact data):
            - GPS Coordinates: ${exifData.gps_latitude}, ${exifData.gps_longitude}
            - Date Taken: ${exifData.date_taken}
            - Camera: ${exifData.camera_make} ${exifData.camera_model}
            - Dimensions: ${exifData.original_width} x ${exifData.original_height}
            - Has EXIF: ${exifData.has_exif}
            
            The caption should be one to two sentences that describes the image in a fun, playful way.
            The ai_description should be a comprehensive 2-4 sentence description that captures all the key elements of the image including people, objects, setting, activities, emotions, and context. This should be detailed enough to give someone who hasn't seen the image a complete understanding of what's happening.
            The people_detected should be a list of people detected in the image.
            The objects should be a list of objects detected in the image.
            The location should be the location of the image including the city, state, country and key landmarks. 
            
            CRITICAL LOCATION INSTRUCTIONS:
            - Use the PRE-EXTRACTED GPS coordinates above to determine the actual geographic location
            - Use the GPS coordinates to identify the city, state/province, and country where the photo was taken
            - Do NOT return "Unknown location" if GPS coordinates are available in the pre-extracted data
            - Only return "Unknown location" if no GPS coordinates are present AND no location is visible in the image
            
            Examples:
            - If GPS shows 42.0139, -87.7158, return "Evanston, Illinois, United States"
            - If GPS shows 40.7128, -74.006, return "New York City, New York, United States"
            - If GPS shows 51.5074, -0.1278, return "London, England, United Kingdom"
            
            For the exif_data field, use the PRE-EXTRACTED values:
            - gps_latitude: ${exifData.gps_latitude}
            - gps_longitude: ${exifData.gps_longitude}
            - date_taken: ${exifData.date_taken}
            - camera_make: ${exifData.camera_make}
            - camera_model: ${exifData.camera_model}
            - original_width: ${exifData.original_width}
            - original_height: ${exifData.original_height}
            
            IMPORTANT: Use the exact GPS coordinates from the pre-extracted EXIF data for location determination.
            `
          },
          {
            type: 'input_image',
            image_url: imageUrl
          }
        ]
      }
    ],
    max_output_tokens: 10000
  };

  const response = await makeOpenAIRequest(payload);
  return parseOpenAIResponse(response);
}

/**
 * Create a text analysis request
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} The text analysis results
 */
async function analyzeText(text) {
  const payload = {
    model: 'gpt-5',
    instructions: 'You are a precise text analysis tool. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'text_analysis',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            caption: {
              type: 'string',
              description: 'A descriptive caption for the text content'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Relevant tags for the text content'
            }
          },
          required: ['caption', 'tags']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Analyze this text and provide a caption and relevant tags: "${text}". Return ONLY JSON with the analysis.`
          }
        ]
      }
    ],
    max_output_tokens: 10000
  };

  const response = await makeOpenAIRequest(payload);
  return parseOpenAIResponse(response);
}

// Note: analyzeLocation function removed - location detection now handled in analyzeImage function

/**
 * Create a photo selection request based on asset attributes and memory book prompt
 * @param {Array} assets - Array of asset objects with database attributes
 * @param {string} aiSupplementalPrompt - The memory book's AI supplemental prompt
 * @param {number} targetCount - Number of photos to select
 * @returns {Promise<Object>} The photo selection results
 */
async function selectPhotosByAttributes(assets, aiSupplementalPrompt, targetCount = 3, previouslyUsedAssetIds = []) {
  if (!assets || assets.length === 0) {
    throw new Error('No assets provided for selection');
  }

  if (!aiSupplementalPrompt || aiSupplementalPrompt.trim() === '') {
    throw new Error('AI supplemental prompt is required for photo selection');
  }

  // Validate input size - Response API max_output_tokens covers both input and output combined
  const MAX_COMBINED_TOKENS = 30000; // Set to match max_output_tokens
  const ESTIMATED_TOKENS_PER_PHOTO = 250; // Conservative estimate
  const ESTIMATED_OUTPUT_TOKENS = 500; // Estimated tokens for JSON response
  const PROMPT_OVERHEAD_TOKENS = 1000; // Base prompt instructions
  const estimatedInputTokens = assets.length * ESTIMATED_TOKENS_PER_PHOTO + PROMPT_OVERHEAD_TOKENS;
  const estimatedTotalTokens = estimatedInputTokens + ESTIMATED_OUTPUT_TOKENS;
  
  if (estimatedTotalTokens > MAX_COMBINED_TOKENS) {
    const maxPhotos = Math.floor((MAX_COMBINED_TOKENS - PROMPT_OVERHEAD_TOKENS - ESTIMATED_OUTPUT_TOKENS) / ESTIMATED_TOKENS_PER_PHOTO);
    console.warn(`⚠️ Estimated total token count (${estimatedTotalTokens}) exceeds API limit (${MAX_COMBINED_TOKENS}). Limiting to ${maxPhotos} photos.`);
    assets = assets.slice(0, maxPhotos);
  }

  // Calculate minimum required photos in pool (3x the target count for breathing room)
  const minimumRequiredPoolSize = targetCount * 3;
  
  // Check if excluding previously used photos would leave insufficient photos
  let availableAssets = assets;
  let excludedPreviouslyUsed = false;
  
  if (previouslyUsedAssetIds && previouslyUsedAssetIds.length > 0) {
    const assetsAfterExclusion = assets.filter(asset => !previouslyUsedAssetIds.includes(asset.id));
    
    // Only exclude previously used photos if we have enough remaining photos
    if (assetsAfterExclusion.length >= minimumRequiredPoolSize) {
      availableAssets = assetsAfterExclusion;
      excludedPreviouslyUsed = true;
      console.log(`🎯 Excluding ${previouslyUsedAssetIds.length} previously used photos. ${availableAssets.length} photos available for selection.`);
    } else {
      console.log(`⚠️ Not excluding previously used photos - would leave only ${assetsAfterExclusion.length} photos, need at least ${minimumRequiredPoolSize} for breathing room. Using all ${assets.length} photos.`);
    }
  }

  if (availableAssets.length === 0) {
    throw new Error('No photos available for selection. Please add more photos to your collection.');
  }

  // If we don't have enough photos, use all available
  if (availableAssets.length < targetCount) {
    console.warn(`⚠️ Only ${availableAssets.length} photos available, but ${targetCount} requested. Using all available photos.`);
    targetCount = availableAssets.length;
  }

  console.log(`🎯 Selecting ${targetCount} photos from ${availableAssets.length} available assets based on prompt: "${aiSupplementalPrompt}"`);

  // Prepare asset data for AI analysis
  const assetData = availableAssets.map((asset, index) => ({
    number: index + 1,
    id: asset.id,
    title: asset.title || '',
    ai_caption: asset.ai_caption || '',
    ai_description: asset.ai_description || '',
    user_caption: asset.user_caption || '',
    tags: Array.isArray(asset.tags) ? asset.tags.join(', ') : '',
    user_tags: Array.isArray(asset.user_tags) ? asset.user_tags.join(', ') : '',
    user_people: Array.isArray(asset.user_people) ? asset.user_people.join(', ') : '',
    city: asset.city || '',
    state: asset.state || '',
    country: asset.country || '',
    asset_date: asset.asset_date ? new Date(asset.asset_date).toLocaleDateString() : '',
    location: asset.location || ''
  }));

  const payload = {
    model: 'gpt-4o',
    instructions: 'You are a warm, caring grandmother selecting meaningful family photos based on their attributes and a specific prompt. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'photo_selection_by_attributes',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            selected_photo_numbers: {
              type: 'array',
              items: {
                type: 'integer',
                minimum: 1
              },
              description: `Array of exactly ${targetCount} photo numbers (1, 2, 3, etc.) selected from the provided pool`
            },
            reasoning: {
              type: 'string',
              description: 'Brief explanation of why these photos were selected'
            }
          },
          required: ['selected_photo_numbers', 'reasoning']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `I want to create a memory book with the theme: "${aiSupplementalPrompt}"

I have ${availableAssets.length} photos to choose from. Please select exactly ${targetCount} photos that would work best together to tell a story for this memory book.

For each photo, I have the following information:
- Title
- AI-generated caption
- AI-generated description (comprehensive details about the photo)
- User caption
- Tags (AI and user-generated)
- People identified
- Location (city, state, country)
- Date taken

CRITICAL SELECTION PRIORITY (in order of importance):
1. **LOCATION MATCH**: If the prompt mentions a specific location (city, state, or country), prioritize photos from that exact location first. For example, if the prompt says "Chicago Vacation", look for photos from Chicago, Illinois, or the greater Chicago area first.

2. **DATE MATCH**: If the prompt mentions a specific date or time period, prioritize photos with dates close to that time.

3. **THEMATIC CONTENT**: Choose photos that tell a cohesive story together and relate to the theme.

4. **PEOPLE & EVENTS**: Consider the people, places, and events mentioned in the prompt.

5. **RELEVANT TAGS/CAPTIONS**: Look for photos with meaningful captions or tags that relate to the prompt.

LOCATION MATCHING HIERARCHY (in order of priority):
1. **EXACT CITY MATCH**: Match exact city name (e.g., "Chicago" matches "Chicago, Illinois")
2. **WITHIN 100 MILES**: Photos from zip codes within 100 miles of the target city's zip code
3. **STATE MATCH**: Photos from the same state as the target location
4. **COUNTRY MATCH**: Photos from the same country as the target location
5. **THEMATIC FALLBACK**: If no location matches found, select photos based on theme relevance

**IMPORTANT**: If no location-specific photos exist, you MUST still select photos from other locations to meet the required count

Here are the available photos:

${assetData.map(asset => `
Photo ${asset.number}:
- Title: ${asset.title}
- AI Caption: ${asset.ai_caption}
- AI Description: ${asset.ai_description}
- User Caption: ${asset.user_caption}
- Tags: ${asset.tags}
- User Tags: ${asset.user_tags}
- People: ${asset.user_people}
- Location: ${asset.city}${asset.state ? ', ' + asset.state : ''}${asset.country ? ', ' + asset.country : ''}
- Date: ${asset.asset_date}
`).join('\n')}

Select exactly ${targetCount} photos that best match the theme "${aiSupplementalPrompt}". 

CRITICAL: You MUST select exactly ${targetCount} photos - never fewer, never more.

LOCATION PRIORITY RULES:
- If the prompt mentions a specific location, prioritize photos from that location first
- If you have enough location-specific photos to fill the quota (${targetCount} photos), use only those
- If you don't have enough location-specific photos, fill the remaining slots with the most thematically relevant photos from other locations
- When mixing location and thematic photos, prioritize location photos first, then fill remaining slots with thematic photos
- **CRITICAL**: If NO location-specific photos exist, you MUST select ${targetCount} photos from other locations based on thematic relevance
- EXAMPLE: If prompt is "Miami Vacation" and you only have 1 Miami photo but need 2 photos, select the Miami photo + 1 most relevant non-Miami photo
- EXAMPLE: If prompt is "Chicago Vacation" but NO Chicago photos exist, select ${targetCount} most thematically relevant photos from any location

FINAL REMINDER: You MUST return exactly ${targetCount} photo numbers, even if it means selecting photos from different locations or themes. NEVER return fewer than ${targetCount} photos.

Return ONLY JSON with the selected photo numbers and your reasoning.`
          }
        ]
      }
    ],
    max_output_tokens: 30000
  };

  const response = await makeOpenAIRequest(payload);
  const result = parseOpenAIResponse(response);
  
  // Map the selected photo numbers back to the original asset array indices
  if (result && result.selected_photo_numbers) {
    // Convert selected photo numbers to original indices (0-based)
    result.selected_photo_numbers = result.selected_photo_numbers.map(num => num - 1);
    
    // Validate that all selected indices are valid
    const validIndices = result.selected_photo_numbers.every(num => 
      num >= 0 && num < availableAssets.length && !isNaN(num)
    );
    
    if (!validIndices) {
      throw new Error('AI returned invalid photo selection indices');
    }
  }
  
  // Ensure we have exactly the requested number of photos
  let finalSelectedIndices = result.selected_photo_numbers || [];
  
  if (finalSelectedIndices.length < targetCount) {
    console.log(`⚠️ AI only selected ${finalSelectedIndices.length} photos, need ${targetCount}. Using location hierarchy to find additional photos...`);
    
    // Extract location information from the prompt to determine target location
    const promptLower = aiSupplementalPrompt.toLowerCase();
    let targetLocation = { city: null, state: null, country: null };
    
    // Simple location extraction from prompt (in production, use NLP)
    const cityMatch = promptLower.match(/\b(chicago|new york|los angeles|miami|san francisco|boston|seattle|denver|austin|nashville|orlando|las vegas|phoenix|dallas|houston|atlanta|philadelphia|washington|detroit|minneapolis)\b/);
    if (cityMatch) {
      targetLocation.city = cityMatch[1];
    }
    
    // Use location hierarchy to find additional photos
    const locationResult = await findPhotosByLocationHierarchy(availableAssets, targetLocation, targetCount, finalSelectedIndices);
    
    // If we found photos through location hierarchy, use them
    if (locationResult.indices.length > 0) {
      finalSelectedIndices = [...finalSelectedIndices, ...locationResult.indices];
      
      // Create detailed reasoning about location matching
      const matchTypeCounts = locationResult.matchTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      let locationReasoning = '';
      if (matchTypeCounts.exact_city) {
        locationReasoning += `${matchTypeCounts.exact_city} exact city match${matchTypeCounts.exact_city > 1 ? 'es' : ''}`;
      }
      if (matchTypeCounts.within_100_miles_api) {
        if (locationReasoning) locationReasoning += ', ';
        locationReasoning += `${matchTypeCounts.within_100_miles_api} within 100 miles (API)`;
      }
      if (matchTypeCounts.within_100_miles_approx) {
        if (locationReasoning) locationReasoning += ', ';
        locationReasoning += `${matchTypeCounts.within_100_miles_approx} within 100 miles (approx)`;
      }
      if (matchTypeCounts.state) {
        if (locationReasoning) locationReasoning += ', ';
        locationReasoning += `${matchTypeCounts.state} state match${matchTypeCounts.state > 1 ? 'es' : ''}`;
      }
      if (matchTypeCounts.country) {
        if (locationReasoning) locationReasoning += ', ';
        locationReasoning += `${matchTypeCounts.country} country match${matchTypeCounts.country > 1 ? 'es' : ''}`;
      }
      if (matchTypeCounts.thematic) {
        if (locationReasoning) locationReasoning += ', ';
        locationReasoning += `${matchTypeCounts.thematic} thematic selection${matchTypeCounts.thematic > 1 ? 's' : ''}`;
      }
      
      if (finalSelectedIndices.length === 0) {
        result.reasoning = `No photos were found matching the specific location mentioned in "${aiSupplementalPrompt}". Selected ${locationResult.indices.length} photos using location hierarchy: ${locationReasoning}.`;
      } else {
        result.reasoning += ` Added ${locationResult.indices.length} additional photos using location hierarchy: ${locationReasoning}.`;
      }
    } else {
      // Fallback to original date/location method if location hierarchy didn't work
      console.log(`⚠️ Location hierarchy didn't find enough photos, falling back to date/location method...`);
      
      // Get the selected photos to analyze their dates and locations
      const selectedPhotos = finalSelectedIndices.map(index => availableAssets[index]).filter(Boolean);
      
      // Find additional photos based on dates and locations of selected photos
      const additionalPhotos = findAdditionalPhotosByDateAndLocation(availableAssets, selectedPhotos, targetCount - finalSelectedIndices.length, finalSelectedIndices);
      
      finalSelectedIndices = [...finalSelectedIndices, ...additionalPhotos];
      
      // Update reasoning to explain the additional selections
      if (finalSelectedIndices.length === 0) {
        result.reasoning = `No photos were found matching the specific location mentioned in "${aiSupplementalPrompt}". Selected ${additionalPhotos.length} photos from other locations that best match the theme and will work well together to tell a story.`;
      } else {
        result.reasoning += ` Added ${additionalPhotos.length} additional photos based on dates and locations of selected photos to reach the required ${targetCount} photos.`;
      }
    }
  }
  
  console.log(`✅ Selected photos: ${finalSelectedIndices.join(', ')}`);
  console.log(`📝 Reasoning: ${result.reasoning}`);
  
  // Add note about previously used photos if applicable
  if (!excludedPreviouslyUsed && previouslyUsedAssetIds && previouslyUsedAssetIds.length > 0) {
    result.reasoning += ` (Included previously used photos to ensure sufficient variety - had ${assets.length} total photos available)`;
  }
  
  return {
    selected_photo_numbers: finalSelectedIndices,
    reasoning: result.reasoning
  };
}

// Simple in-memory cache for zip code radius results
const zipCodeCache = new Map();

// Helper function to get zip codes within a specified radius using ZipCodeAPI.com
async function getZipCodesWithinRadius(targetZipCode, radiusMiles = 100) {
  const API_KEY = process.env.ZIP_CODE_API;
  
  // Check cache first
  const cacheKey = `zip_radius_${targetZipCode}_${radiusMiles}`;
  if (zipCodeCache.has(cacheKey)) {
    const cached = zipCodeCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
      console.log(`📦 Using cached zip codes for ${targetZipCode} within ${radiusMiles} miles`);
      return cached.zipCodes;
    } else {
      zipCodeCache.delete(cacheKey); // Expired cache
    }
  }
  
  if (!API_KEY) {
    console.log('⚠️ No ZIP_CODE_API key found, using approximation');
    return null;
  }
  
  try {
    console.log(`🌐 Fetching zip codes within ${radiusMiles} miles of ${targetZipCode} from ZipCodeAPI.com`);
    
    const url = `https://www.zipcodeapi.com/rest/${API_KEY}/radius.json/${targetZipCode}/${radiusMiles}/miles`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`⚠️ ZipCodeAPI error for ${targetZipCode}: ${response.status} - ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.zip_codes && Array.isArray(data.zip_codes)) {
      const zipCodes = data.zip_codes.map(zip => zip.zip_code);
      
      // Cache the result for 24 hours
      zipCodeCache.set(cacheKey, {
        zipCodes: zipCodes,
        timestamp: Date.now()
      });
      
      console.log(`✅ Found ${zipCodes.length} zip codes within ${radiusMiles} miles of ${targetZipCode}`);
      return zipCodes;
    } else {
      console.log(`⚠️ Unexpected API response format for ${targetZipCode}`);
      return null;
    }
    
  } catch (error) {
    console.log(`⚠️ Error fetching zip codes for ${targetZipCode}: ${error.message}, falling back to approximation`);
    return null;
  }
}

// Helper function to calculate distance between two zip codes (fallback method)
function calculateZipCodeDistance(zip1, zip2) {
  // Convert zip codes to numbers for comparison
  const zip1Num = parseInt(zip1);
  const zip2Num = parseInt(zip2);
  
  if (isNaN(zip1Num) || isNaN(zip2Num)) {
    return null; // Invalid zip codes
  }
  
  // Basic distance approximation based on zip code difference
  // This is a rough estimate - in production, use a proper zip code distance service
  const difference = Math.abs(zip1Num - zip2Num);
  
  // Rough conversion: 1000 zip code difference ≈ 50 miles
  // This varies by region, but gives us a reasonable approximation
  return Math.round(difference / 20);
}

// Helper function to get zip code for a city (simplified lookup)
function getCityZipCode(city, state) {
  // This is a simplified lookup - in production, you'd use a geocoding service
  const cityZipCodes = {
    'Chicago': '60601',
    'New York': '10001',
    'Los Angeles': '90001',
    'Miami': '33101',
    'San Francisco': '94101',
    'Boston': '02101',
    'Seattle': '98101',
    'Denver': '80201',
    'Austin': '73301',
    'Nashville': '37201',
    'Orlando': '32801',
    'Las Vegas': '89101',
    'Phoenix': '85001',
    'Dallas': '75201',
    'Houston': '77001',
    'Atlanta': '30301',
    'Philadelphia': '19101',
    'Washington': '20001',
    'Detroit': '48201',
    'Minneapolis': '55401'
  };
  
  const key = city || '';
  return cityZipCodes[key] || null;
}

// Helper function to find additional photos based on dates and locations
function findAdditionalPhotosByDateAndLocation(allAssets, selectedPhotos, neededCount, alreadySelectedIndices) {
  const additionalIndices = [];
  
  if (selectedPhotos.length === 0 || neededCount <= 0) {
    return additionalIndices;
  }
  
  // Extract dates and locations from selected photos
  const selectedDates = selectedPhotos
    .map(photo => photo.asset_date)
    .filter(date => date)
    .map(date => new Date(date));
  
  const selectedLocations = selectedPhotos
    .map(photo => ({
      city: photo.city,
      state: photo.state,
      country: photo.country
    }))
    .filter(loc => loc.city || loc.state || loc.country);
  
  // Score remaining photos based on date and location similarity
  const remainingAssets = allAssets.filter((_, index) => !alreadySelectedIndices.includes(index));
  const scoredAssets = remainingAssets.map((asset, index) => {
    let score = 0;
    
    // Date similarity scoring
    if (asset.asset_date && selectedDates.length > 0) {
      const assetDate = new Date(asset.asset_date);
      const minDateDiff = Math.min(...selectedDates.map(date => Math.abs(assetDate - date)));
      const daysDiff = minDateDiff / (1000 * 60 * 60 * 24);
      
      // Higher score for photos within 30 days, lower score for photos within 1 year
      if (daysDiff <= 30) score += 10;
      else if (daysDiff <= 365) score += 5;
      else if (daysDiff <= 1095) score += 2; // Within 3 years
    }
    
    // Location similarity scoring
    if (selectedLocations.length > 0) {
      const assetLocation = {
        city: asset.city,
        state: asset.state,
        country: asset.country
      };
      
      const locationMatch = selectedLocations.some(selected => {
        if (selected.city && assetLocation.city && selected.city.toLowerCase() === assetLocation.city.toLowerCase()) return true;
        if (selected.state && assetLocation.state && selected.state.toLowerCase() === assetLocation.state.toLowerCase()) return true;
        if (selected.country && assetLocation.country && selected.country.toLowerCase() === assetLocation.country.toLowerCase()) return true;
        return false;
      });
      
      if (locationMatch) score += 8;
    }
    
    return {
      originalIndex: allAssets.indexOf(asset),
      score: score
    };
  });
  
  // Sort by score (highest first) and take the needed number
  scoredAssets.sort((a, b) => b.score - a.score);
  
  for (let i = 0; i < Math.min(neededCount, scoredAssets.length); i++) {
    additionalIndices.push(scoredAssets[i].originalIndex);
  }
  
  return additionalIndices;
}

// Helper function to find photos based on location hierarchy
async function findPhotosByLocationHierarchy(allAssets, targetLocation, targetCount, alreadySelectedIndices = []) {
  const targetCity = targetLocation.city;
  const targetState = targetLocation.state;
  const targetCountry = targetLocation.country;
  
  // Get target city zip code
  const targetZipCode = getCityZipCode(targetCity, targetState);
  
  // Get zip codes within 100 miles using API (with fallback to approximation)
  let nearbyZipCodes = null;
  if (targetZipCode) {
    nearbyZipCodes = await getZipCodesWithinRadius(targetZipCode, 100);
  }
  
  // Score all available assets based on location hierarchy
  const remainingAssets = allAssets.filter((_, index) => !alreadySelectedIndices.includes(index));
  const scoredAssets = remainingAssets.map((asset, index) => {
    let score = 0;
    let matchType = 'none';
    
    // 1. EXACT CITY MATCH (highest priority)
    if (targetCity && asset.city && targetCity.toLowerCase() === asset.city.toLowerCase()) {
      score = 100;
      matchType = 'exact_city';
    }
    // 2. WITHIN 100 MILES (using API or approximation)
    else if (targetZipCode && asset.zip_code) {
      if (nearbyZipCodes && nearbyZipCodes.includes(asset.zip_code)) {
        // Use API result - all zip codes in the list are within 100 miles
        score = 80; // Base score for within 100 miles
        matchType = 'within_100_miles_api';
      } else {
        // Fall back to approximation
        const distance = calculateZipCodeDistance(targetZipCode, asset.zip_code);
        if (distance !== null && distance <= 100) {
          score = 80 - Math.floor(distance / 10); // Higher score for closer zip codes
          matchType = 'within_100_miles_approx';
        }
      }
    }
    // 3. STATE MATCH
    else if (targetState && asset.state && targetState.toLowerCase() === asset.state.toLowerCase()) {
      score = 60;
      matchType = 'state';
    }
    // 4. COUNTRY MATCH
    else if (targetCountry && asset.country && targetCountry.toLowerCase() === asset.country.toLowerCase()) {
      score = 40;
      matchType = 'country';
    }
    // 5. THEMATIC FALLBACK (no location match)
    else {
      score = 10; // Base score for thematic relevance
      matchType = 'thematic';
    }
    
    return {
      originalIndex: allAssets.indexOf(asset),
      score: score,
      matchType: matchType
    };
  });
  
  // Sort by score (highest first) and take the needed number
  scoredAssets.sort((a, b) => b.score - a.score);
  
  const selectedIndices = [];
  for (let i = 0; i < Math.min(targetCount, scoredAssets.length); i++) {
    selectedIndices.push(scoredAssets[i].originalIndex);
  }
  
  return {
    indices: selectedIndices,
    matchTypes: scoredAssets.slice(0, targetCount).map(item => item.matchType)
  };
}

export {
  aiCropRecommendation,
  selectPhotos,
  generateStory,
  generateStoryFromAttributes,
  analyzePhotoShape,
  analyzeImage,
  analyzeText,
  selectPhotosByAttributes,
  makeOpenAIRequest,
  parseOpenAIResponse
};
