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

  // Add timeout configuration
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

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
      throw new Error('OpenAI API request timed out after 2 minutes');
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

Here are the selected photos:

${assetData}

Return ONLY JSON with the story.`
          }
        ]
      }
    ],
    max_output_tokens: 1000
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

  // Filter out previously used photos if provided
  let availableAssets = assets;
  if (previouslyUsedAssetIds && previouslyUsedAssetIds.length > 0) {
    availableAssets = assets.filter(asset => !previouslyUsedAssetIds.includes(asset.id));
    console.log(`🎯 Excluding ${previouslyUsedAssetIds.length} previously used photos. ${availableAssets.length} photos available for selection.`);
  }

  if (availableAssets.length === 0) {
    throw new Error('No photos available for selection after excluding previously used photos. Please add more photos to your collection.');
  }

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
1. **EXACT LOCATION MATCH**: If the prompt mentions a specific location (city, state, or country), you MUST prioritize photos from that exact location first. For example, if the prompt says "Chicago Vacation", look for photos from Chicago, Illinois, or the greater Chicago area first.

2. **DATE MATCH**: If the prompt mentions a specific date or time period, prioritize photos with dates close to that time.

3. **THEMATIC CONTENT**: Choose photos that tell a cohesive story together and relate to the theme.

4. **PEOPLE & EVENTS**: Consider the people, places, and events mentioned in the prompt.

5. **RELEVANT TAGS/CAPTIONS**: Look for photos with meaningful captions or tags that relate to the prompt.

LOCATION MATCHING RULES:
- For city names: Match exact city name (e.g., "Chicago" matches "Chicago, Illinois")
- For state names: Match photos from that state
- For country names: Match photos from that country
- For regional terms: Match photos from the general area (e.g., "Chicago area" includes nearby suburbs)
- If no location-specific photos exist, then fall back to thematic matching

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
- EXAMPLE: If prompt is "Miami Vacation" and you only have 1 Miami photo but need 2 photos, select the Miami photo + 1 most relevant non-Miami photo

FINAL REMINDER: You MUST return exactly ${targetCount} photo numbers, even if it means selecting photos from different locations or themes.

Return ONLY JSON with the selected photo numbers and your reasoning.`
          }
        ]
      }
    ],
    max_output_tokens: 2000
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
  
  console.log(`✅ Selected photos: ${result.selected_photo_numbers?.join(', ')}`);
  console.log(`📝 Reasoning: ${result.reasoning}`);
  
  return result;
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
