// Test script for attribute-based photo selection
// This tests the new selectPhotosByAttributes function

import { selectPhotosByAttributes } from '../server/utils/openai-client.js'

// Mock assets data
const mockAssets = [
  {
    id: 'asset-1',
    title: 'Beach Vacation',
    ai_caption: 'Family enjoying a sunny day at the beach',
    user_caption: 'Our first family beach trip',
    tags: ['beach', 'family', 'vacation', 'summer'],
    user_tags: ['happy', 'memories'],
    user_people: ['Mom', 'Dad', 'Kids'],
    city: 'Miami',
    state: 'Florida',
    country: 'USA',
    asset_date: '2023-07-15T10:00:00Z'
  },
  {
    id: 'asset-2',
    title: 'Mountain Hiking',
    ai_caption: 'Scenic mountain trail with beautiful views',
    user_caption: 'Hiking in the Rockies',
    tags: ['mountain', 'hiking', 'nature', 'outdoors'],
    user_tags: ['adventure', 'exercise'],
    user_people: ['Dad', 'Son'],
    city: 'Denver',
    state: 'Colorado',
    country: 'USA',
    asset_date: '2023-08-20T14:30:00Z'
  },
  {
    id: 'asset-3',
    title: 'Birthday Party',
    ai_caption: 'Birthday celebration with cake and decorations',
    user_caption: 'Sarah\'s 10th birthday',
    tags: ['birthday', 'celebration', 'cake', 'party'],
    user_tags: ['family', 'celebration'],
    user_people: ['Sarah', 'Mom', 'Dad', 'Friends'],
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    asset_date: '2023-06-10T16:00:00Z'
  },
  {
    id: 'asset-4',
    title: 'Christmas Dinner',
    ai_caption: 'Family gathered around the Christmas dinner table',
    user_caption: 'Christmas with the whole family',
    tags: ['christmas', 'dinner', 'family', 'holiday'],
    user_tags: ['tradition', 'love'],
    user_people: ['Grandma', 'Grandpa', 'Mom', 'Dad', 'Kids'],
    city: 'New York',
    state: 'New York',
    country: 'USA',
    asset_date: '2022-12-25T18:00:00Z'
  },
  {
    id: 'asset-5',
    title: 'School Graduation',
    ai_caption: 'Graduation ceremony with cap and gown',
    user_caption: 'High school graduation day',
    tags: ['graduation', 'school', 'achievement', 'ceremony'],
    user_tags: ['proud', 'milestone'],
    user_people: ['Student', 'Parents', 'Teachers'],
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    asset_date: '2023-05-15T19:00:00Z'
  },
  {
    id: 'asset-6',
    title: 'Chicago Skyline',
    ai_caption: 'Beautiful view of the Chicago skyline from the lake',
    user_caption: 'Chicago vacation memories',
    tags: ['chicago', 'skyline', 'city', 'vacation'],
    user_tags: ['travel', 'memories'],
    user_people: ['Family'],
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    asset_date: '2023-09-15T12:00:00Z'
  },
  {
    id: 'asset-7',
    title: 'Millennium Park',
    ai_caption: 'Family at the Cloud Gate sculpture in Millennium Park',
    user_caption: 'The Bean in Chicago',
    tags: ['chicago', 'millennium park', 'cloud gate', 'sculpture'],
    user_tags: ['landmark', 'tourist'],
    user_people: ['Mom', 'Dad', 'Kids'],
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    asset_date: '2023-09-16T14:00:00Z'
  }
]

// Test cases
const testCases = [
  {
    name: 'Beach vacation theme',
    prompt: 'Our family beach vacation in Miami',
    expectedLocation: 'Miami',
    expectedCount: 2
  },
  {
    name: 'Chicago vacation theme',
    prompt: 'Chicago Vacation',
    expectedLocation: 'Chicago',
    expectedCount: 2
  },
  {
    name: 'Birthday celebration theme',
    prompt: 'Birthday celebrations and family parties',
    expectedKeywords: ['birthday', 'party', 'celebration'],
    expectedCount: 2
  },
  {
    name: 'Mountain adventure theme',
    prompt: 'Outdoor adventures and hiking trips',
    expectedKeywords: ['mountain', 'hiking', 'adventure'],
    expectedCount: 2
  },
  {
    name: 'Christmas family theme',
    prompt: 'Christmas traditions and family gatherings',
    expectedKeywords: ['christmas', 'family', 'dinner'],
    expectedCount: 2
  }
]

async function runTests() {
  console.log('🧪 Testing attribute-based photo selection...\n')
  
  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`)
    console.log(`🎯 Prompt: "${testCase.prompt}"`)
    
    try {
      const result = await selectPhotosByAttributes(mockAssets, testCase.prompt, testCase.expectedCount)
      
      console.log(`✅ Selected ${result.selected_photo_numbers.length} photos`)
      console.log(`📝 Reasoning: ${result.reasoning}`)
      
      // Get the selected assets
      const selectedAssets = result.selected_photo_numbers.map(index => mockAssets[index])
      console.log('📸 Selected photos:')
      selectedAssets.forEach((asset, i) => {
        console.log(`  ${i + 1}. ${asset.title} (${asset.city}, ${asset.state})`)
      })
      
      // Validate selection
      if (result.selected_photo_numbers.length === testCase.expectedCount) {
        console.log('✅ Correct number of photos selected')
      } else {
        console.log(`❌ Expected ${testCase.expectedCount} photos, got ${result.selected_photo_numbers.length}`)
      }
      
      // Check if location-based selection worked
      if (testCase.expectedLocation) {
        const hasLocationMatch = selectedAssets.some(asset => 
          asset.city === testCase.expectedLocation || 
          asset.state === testCase.expectedLocation
        )
        if (hasLocationMatch) {
          console.log(`✅ Location match found for ${testCase.expectedLocation}`)
        } else {
          console.log(`❌ No location match found for ${testCase.expectedLocation}`)
        }
      }
      
      // Check if keyword-based selection worked
      if (testCase.expectedKeywords) {
        const hasKeywordMatch = selectedAssets.some(asset => 
          testCase.expectedKeywords.some(keyword => 
            asset.tags.includes(keyword) || 
            asset.user_tags.includes(keyword) ||
            asset.ai_caption.toLowerCase().includes(keyword) ||
            asset.user_caption.toLowerCase().includes(keyword)
          )
        )
        if (hasKeywordMatch) {
          console.log(`✅ Keyword match found for: ${testCase.expectedKeywords.join(', ')}`)
        } else {
          console.log(`❌ No keyword match found for: ${testCase.expectedKeywords.join(', ')}`)
        }
      }
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`)
    }
    
    console.log('') // Empty line for readability
  }
  
  console.log('🏁 All tests completed!')
}

// Run the tests
runTests().catch(console.error)
