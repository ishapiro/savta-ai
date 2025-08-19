// Test for story generation with photo selection reasoning
import { generateStoryFromAttributes } from '../server/utils/openai-client.js'

// Mock data for testing
const mockSelectedAssets = [
  {
    id: '1',
    title: 'Beach Day',
    ai_caption: 'Family enjoying a sunny day at the beach',
    user_caption: 'Perfect beach day with the kids',
    tags: ['beach', 'family', 'summer'],
    user_tags: ['vacation', 'fun'],
    user_people: ['mom', 'dad', 'kids'],
    city: 'Miami',
    state: 'Florida',
    country: 'USA',
    asset_date: '2023-07-15'
  },
  {
    id: '2',
    title: 'Sunset Walk',
    ai_caption: 'Beautiful sunset walk along the shore',
    user_caption: 'Evening stroll at sunset',
    tags: ['sunset', 'walk', 'beach'],
    user_tags: ['romantic', 'peaceful'],
    user_people: ['mom', 'dad'],
    city: 'Miami',
    state: 'Florida',
    country: 'USA',
    asset_date: '2023-07-16'
  }
]

const mockAiSupplementalPrompt = 'Florida Vacation'
const mockPhotoSelectionReasoning = 'These photos were selected because they both feature the Miami beach location mentioned in the vacation theme, and they show different times of day (day and sunset) which creates a nice narrative flow.'

async function testStoryGenerationWithReasoning() {
  console.log('🧪 Testing story generation WITH photo selection reasoning...')
  
  try {
    const result = await generateStoryFromAttributes(
      mockSelectedAssets, 
      mockAiSupplementalPrompt, 
      mockPhotoSelectionReasoning
    )
    
    console.log('✅ Story generation successful!')
    console.log('📝 Generated story:', result.story)
    console.log('📊 Result object:', result)
    
    // Verify the story includes elements from the reasoning
    if (result.story && result.story.includes('Miami') || result.story.includes('beach')) {
      console.log('✅ Story appears to incorporate location context from reasoning')
    } else {
      console.log('⚠️ Story may not be incorporating location context')
    }
    
  } catch (error) {
    console.error('❌ Story generation failed:', error.message)
    console.error('📊 Error details:', error)
  }
}

async function testStoryGenerationWithoutReasoning() {
  console.log('\n🧪 Testing story generation WITHOUT photo selection reasoning...')
  
  try {
    const result = await generateStoryFromAttributes(
      mockSelectedAssets, 
      mockAiSupplementalPrompt
      // No photoSelectionReasoning parameter
    )
    
    console.log('✅ Story generation successful!')
    console.log('📝 Generated story:', result.story)
    console.log('📊 Result object:', result)
    
    // Verify the story still works without reasoning
    if (result.story && result.story.length > 0) {
      console.log('✅ Story generation works without reasoning (backward compatibility)')
    } else {
      console.log('⚠️ Story generation may have issues without reasoning')
    }
    
  } catch (error) {
    console.error('❌ Story generation failed:', error.message)
    console.error('📊 Error details:', error)
  }
}

// Run both tests
async function runAllTests() {
  await testStoryGenerationWithReasoning()
  await testStoryGenerationWithoutReasoning()
}

runAllTests() 