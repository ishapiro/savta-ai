/**
 * Centralized OpenAI client for the Savta AI application
 * Handles all OpenAI API calls using the Responses API format
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

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
 * Create a story generation request
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
  
  const payload = {
    model: 'gpt-4o',
    instructions: 'You are a precise image analysis tool. Return ONLY JSON that matches the schema.',
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
            }
          },
          required: ['caption', 'tags', 'people_detected', 'objects']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Analyze this image and provide a caption, tags, detected people, objects, and location information. Return ONLY JSON with the analysis.'
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

/**
 * Create a location analysis request
 * @param {string} imageUrl - The URL of the image to analyze
 * @returns {Promise<Object>} The location analysis results
 */
async function analyzeLocation(imageUrl) {
  const payload = {
    model: 'gpt-4o',
    instructions: 'You are a precise location detection tool. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'location_analysis',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            city: {
              type: 'string',
              description: 'City name if visible in the image'
            },
            state: {
              type: 'string',
              description: 'State or province name if visible in the image'
            },
            country: {
              type: 'string',
              description: 'Country name if visible in the image'
            },
            zip_code: {
              type: 'string',
              description: 'ZIP or postal code if visible in the image'
            },
            landmarks: {
              type: 'string',
              description: 'Landmarks or notable places visible in the image'
            },
            neighborhood: {
              type: 'string',
              description: 'Neighborhood or district name if visible in the image'
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Confidence level in the location detection (0-1)'
            },
            reasoning: {
              type: 'string',
              description: 'Explanation of how the location was determined'
            }
          },
          required: ['confidence', 'reasoning']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Detect location information from this image. Look for signs, landmarks, addresses, or any geographical indicators. Return ONLY JSON with the location analysis.'
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

export {
  aiCropRecommendation,
  selectPhotos,
  generateStory,
  analyzePhotoShape,
  analyzeImage,
  analyzeText,
  analyzeLocation,
  makeOpenAIRequest,
  parseOpenAIResponse
};
