// Centralized AI prompts for Savta.ai
// This file contains all prompts used for AI processing to ensure consistency

export const AI_PROMPTS = {
  // Image analysis prompt for family photos
  IMAGE_ANALYSIS: `You are an AI assistant that analyzes family photos and generates:
1. A playful, funny, and meaningful caption (up to 2 sentences long, keep it concise but descriptive)
2. Relevant tags (family, events, emotions, activities)
3. People/objects detected (names if mentioned, relationships, objects)

When generating captions, consider any existing context provided about the image including:
- User-added tags and people
- Previously detected people and objects
- Any existing tags

Respond in JSON format:
{
  "caption": "playful caption here (up to 2 sentences)",
  "tags": ["family", "celebration", "outdoors"],
  "people_detected": ["grandma", "kids", "dog"],
  "objects": ["cake", "balloons"]
}`,

  // Text analysis prompt for family stories
  TEXT_ANALYSIS: `You are an AI assistant that analyzes family stories and generates:
1. A playful, meaningful and funny caption (up to 2 sentences long, keep it concise but descriptive)
2. Relevant tags (family, events, emotions, activities)

When generating captions, consider any existing context provided about the story including:
- User-added tags and people
- Previously detected people and objects
- Any existing tags

Respond in JSON format:
{
  "caption": "playful caption here (up to 3 lines)",
  "tags": ["family", "story", "memory"]
}`,

  // User instruction for image analysis
  IMAGE_USER_INSTRUCTION: (context = {}) => {
    let instruction = 'Analyze this family photo and provide the requested information in JSON format.'
    
    if (context.userTags && context.userTags.length > 0) {
      instruction += `\n\nUser-added tags: ${context.userTags.join(', ')}`
    }
    
    if (context.peopleDetected && context.peopleDetected.length > 0) {
      instruction += `\n\nPreviously detected people: ${context.peopleDetected.join(', ')}`
    }
    
    if (context.userPeople && context.userPeople.length > 0) {
      instruction += `\n\nUser-added people: ${context.userPeople.join(', ')}`
    }
    
    if (context.tags && context.tags.length > 0) {
      instruction += `\n\nExisting tags: ${context.tags.join(', ')}`
    }
    
    return instruction
  },

  // User instruction for text analysis
  TEXT_USER_INSTRUCTION: (text, context = {}) => {
    let instruction = `Analyze this family story: "${text}"`
    
    if (context.userTags && context.userTags.length > 0) {
      instruction += `\n\nUser-added tags: ${context.userTags.join(', ')}`
    }
    
    if (context.peopleDetected && context.peopleDetected.length > 0) {
      instruction += `\n\nPreviously detected people: ${context.peopleDetected.join(', ')}`
    }
    
    if (context.userPeople && context.userPeople.length > 0) {
      instruction += `\n\nUser-added people: ${context.userPeople.join(', ')}`
    }
    
    if (context.tags && context.tags.length > 0) {
      instruction += `\n\nExisting tags: ${context.tags.join(', ')}`
    }
    
    return instruction
  },

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