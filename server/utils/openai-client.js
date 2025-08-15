/**
 * Centralized OpenAI client for the Savta AI application
 * Handles all OpenAI API calls using the Responses API format
 */

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

  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API Error Response:', errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const responseData = await response.json();
  return responseData;
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
 * Create a face detection request
 * @param {string} imageUrl - The URL of the image to analyze
 * @returns {Promise<Object>} The face detection results
 */
async function detectFaces(imageUrl) {
  const payload = {
    model: 'gpt-4o',
    instructions: 'You are a precise vision detector. Return ONLY JSON that matches the schema.',
    text: {
      format: {
        type: 'json_schema',
        name: 'person_detections',
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
            detections: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string', enum: ['person'] },
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
                  },
                  confidence: { type: 'number', minimum: 0, maximum: 1 }
                },
                required: ['id', 'label', 'bbox', 'confidence']
              }
            }
          },
          required: ['image', 'detections']
        }
      }
    },
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Detect all PEOPLE in this image by finding their HEADS and SHOULDERS. Draw bounding boxes around the head and upper torso area of each person. Focus on the face, head, and shoulder region - this is the most important part for cropping. Be thorough and include all visible people, even if partially visible. Return ONLY JSON that matches the schema. Use normalized [0..1] coordinates for bbox with origin at top-left. If no people are present, return {"image":{"width_px":2619,"height_px":3492},"detections":[]}.'
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
 * Create a photo selection request
 * @param {Array} photoUrls - Array of photo URLs or photo objects
 * @returns {Promise<Object>} The photo selection results
 */
async function selectPhotos(photoUrls, photoCount = null) {
  // Handle both URL strings and photo objects with URLs
  const photoInputs = photoUrls.map((photo, index) => {
    const imageUrl = typeof photo === 'string' ? photo : photo.storage_url || photo.asset_url || photo.url;
    return {
      type: 'input_image',
      image_url: imageUrl
    };
  });

  // Determine how many photos to select
  const targetCount = photoCount || Math.min(3, photoUrls.length);

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
            text: `Select exactly ${targetCount} of the most meaningful and visually appealing photos from this collection of ${photoUrls.length} family photos. Choose photos that tell a story together and would make a beautiful memory book. You must select exactly ${targetCount} photos. Return ONLY JSON with the selected photo numbers.`
          },
          ...photoInputs
        ]
      }
    ],
    max_output_tokens: 10000
  };

  const response = await makeOpenAIRequest(payload);
  return parseOpenAIResponse(response);
}

/**
 * Create a story generation request
 * @param {Array} selectedPhotoUrls - Array of selected photo URLs
 * @returns {Promise<Object>} The story generation results
 */
async function generateStory(selectedPhotoUrls) {
  const photoInputs = selectedPhotoUrls.map(url => ({
    type: 'input_image',
    image_url: url
  }));

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
            text: 'Create a warm, heartfelt story that connects these family photos into a beautiful narrative. Make it personal and touching, like something a grandmother would write. Return ONLY JSON with the story.'
          },
          ...photoInputs
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

module.exports = {
  detectFaces,
  selectPhotos,
  generateStory,
  analyzePhotoShape,
  analyzeImage,
  analyzeText,
  analyzeLocation,
  makeOpenAIRequest,
  parseOpenAIResponse
};
