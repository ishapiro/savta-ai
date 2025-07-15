// Centralized AI prompts for Savta.ai
// This file contains all prompts used for AI processing to ensure consistency

export const AI_PROMPTS = {
  // Image analysis prompt for family photos
  IMAGE_ANALYSIS: `You are an AI assistant that analyzes family photos and generates:
1. A playful, meaningful caption (1-2 sentences)
2. Relevant tags (family, events, emotions, activities)
3. People/objects detected (names if mentioned, relationships, objects)

Respond in JSON format:
{
  "caption": "playful caption here",
  "tags": ["family", "celebration", "outdoors"],
  "people_detected": ["grandma", "kids", "dog"],
  "objects": ["cake", "balloons"]
}`,

  // Text analysis prompt for family stories
  TEXT_ANALYSIS: `You are an AI assistant that analyzes family stories and generates:
1. A playful, meaningful and funny caption (1-2 sentences)
2. Relevant tags (family, events, emotions, activities)

Respond in JSON format:
{
  "caption": "playful caption here",
  "tags": ["family", "story", "memory"]
}`,

  // User instruction for image analysis
  IMAGE_USER_INSTRUCTION: 'Analyze this family photo and provide the requested information in JSON format.',

  // User instruction for text analysis
  TEXT_USER_INSTRUCTION: (text) => `Analyze this family story: "${text}"`,

  // Fallback responses when AI fails
  FALLBACKS: {
    IMAGE: {
      ai_caption: 'A beautiful family moment captured forever.',
      tags: ['family', 'memory'],
      people_detected: [],
      objects: []
    },
    TEXT: {
      ai_caption: 'A precious family story to cherish.',
      tags: ['family', 'story'],
      people_detected: [],
      objects: []
    }
  }
}

// Helper function to get the appropriate prompt based on asset type
export function getPromptForAssetType(assetType) {
  switch (assetType) {
    case 'photo':
      return {
        systemPrompt: AI_PROMPTS.IMAGE_ANALYSIS,
        userInstruction: AI_PROMPTS.IMAGE_USER_INSTRUCTION,
        fallback: AI_PROMPTS.FALLBACKS.IMAGE
      }
    case 'text':
      return {
        systemPrompt: AI_PROMPTS.TEXT_ANALYSIS,
        userInstruction: AI_PROMPTS.TEXT_USER_INSTRUCTION,
        fallback: AI_PROMPTS.FALLBACKS.TEXT
      }
    default:
      throw new Error(`Unsupported asset type: ${assetType}`)
  }
} 