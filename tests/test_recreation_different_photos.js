// Test to verify that memory book recreation uses different photos
// This test ensures that when a memory book is recreated, it uses different photos from the previous version

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseKey)

describe('Memory Book Recreation - Different Photos', () => {
  let testUserId
  let testBookId
  let testAssetIds = []

  beforeAll(async () => {
    // Create a test user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: 'test-recreation@example.com',
      password: 'testpassword123',
      email_confirm: true
    })
    
    if (userError) {
      console.error('Error creating test user:', userError)
      throw userError
    }
    
    testUserId = user.user.id

    // Create test assets
    const assetData = [
      {
        user_id: testUserId,
        type: 'photo',
        title: 'Test Photo 1',
        ai_caption: 'A beautiful sunset',
        tags: ['sunset', 'nature'],
        city: 'Chicago',
        state: 'Illinois',
        approved: true
      },
      {
        user_id: testUserId,
        type: 'photo',
        title: 'Test Photo 2',
        ai_caption: 'Family dinner',
        tags: ['family', 'dinner'],
        city: 'Chicago',
        state: 'Illinois',
        approved: true
      },
      {
        user_id: testUserId,
        type: 'photo',
        title: 'Test Photo 3',
        ai_caption: 'Beach vacation',
        tags: ['beach', 'vacation'],
        city: 'Miami',
        state: 'Florida',
        approved: true
      },
      {
        user_id: testUserId,
        type: 'photo',
        title: 'Test Photo 4',
        ai_caption: 'Mountain hiking',
        tags: ['mountain', 'hiking'],
        city: 'Denver',
        state: 'Colorado',
        approved: true
      },
      {
        user_id: testUserId,
        type: 'photo',
        title: 'Test Photo 5',
        ai_caption: 'City skyline',
        tags: ['city', 'skyline'],
        city: 'Chicago',
        state: 'Illinois',
        approved: true
      }
    ]

    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .insert(assetData)
      .select('id')

    if (assetsError) {
      console.error('Error creating test assets:', assetsError)
      throw assetsError
    }

    testAssetIds = assets.map(asset => asset.id)

    // Create a test memory book
    const { data: book, error: bookError } = await supabase
      .from('memory_books')
      .insert({
        user_id: testUserId,
        ai_supplemental_prompt: 'Chicago vacation memories',
        photo_selection_pool: testAssetIds,
        photo_selection_method: 'ai',
        status: 'draft'
      })
      .select('id')
      .single()

    if (bookError) {
      console.error('Error creating test memory book:', bookError)
      throw bookError
    }

    testBookId = book.id
  })

  afterAll(async () => {
    // Clean up test data
    if (testBookId) {
      await supabase.from('memory_books').delete().eq('id', testBookId)
    }
    if (testAssetIds.length > 0) {
      await supabase.from('assets').delete().in('id', testAssetIds)
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId)
    }
  })

  it('should use different photos when recreating a memory book', async () => {
    // Step 1: Generate the first version of the memory book
    console.log('🎯 Step 1: Generating first version of memory book...')
    
    const firstResponse = await fetch('http://localhost:3000/api/ai/magic-memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        memoryBookId: testBookId,
        userId: testUserId,
        photoCount: 2
      })
    })

    expect(firstResponse.ok).toBe(true)
    const firstResult = await firstResponse.json()
    expect(firstResult.success).toBe(true)
    expect(firstResult.selected_photo_ids).toHaveLength(2)

    const firstPhotoIds = firstResult.selected_photo_ids
    console.log('📸 First version photos:', firstPhotoIds)

    // Step 2: Reset the book for regeneration
    console.log('🔄 Step 2: Resetting book for regeneration...')
    
    const resetResponse = await fetch('http://localhost:3000/api/memory-books/reset-for-regeneration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        bookId: testBookId
      })
    })

    expect(resetResponse.ok).toBe(true)
    const resetResult = await resetResponse.json()
    expect(resetResult.success).toBe(true)

    // Step 3: Generate the second version of the memory book
    console.log('🎯 Step 3: Generating second version of memory book...')
    
    const secondResponse = await fetch('http://localhost:3000/api/ai/magic-memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        memoryBookId: testBookId,
        userId: testUserId,
        photoCount: 2
      })
    })

    expect(secondResponse.ok).toBe(true)
    const secondResult = await secondResponse.json()
    expect(secondResult.success).toBe(true)
    expect(secondResult.selected_photo_ids).toHaveLength(2)

    const secondPhotoIds = secondResult.selected_photo_ids
    console.log('📸 Second version photos:', secondPhotoIds)

    // Step 4: Verify that different photos were selected
    console.log('✅ Step 4: Verifying different photos were selected...')
    
    // The photos should be different (since we have 5 photos total and select 2 each time)
    const hasDifferentPhotos = firstPhotoIds.some(id => !secondPhotoIds.includes(id)) ||
                               secondPhotoIds.some(id => !firstPhotoIds.includes(id))
    
    expect(hasDifferentPhotos).toBe(true)
    console.log('🎉 Success: Different photos were selected for recreation!')

    // Step 5: Verify the reasoning mentions using different photos
    expect(secondResult.reasoning).toContain('Using different photos from the previous version')
  })

  it('should handle case where all photos have been used previously', async () => {
    // Create a book with only 2 photos in the pool
    const limitedAssetIds = testAssetIds.slice(0, 2)
    
    const { data: limitedBook, error: limitedBookError } = await supabase
      .from('memory_books')
      .insert({
        user_id: testUserId,
        ai_supplemental_prompt: 'Limited photo test',
        photo_selection_pool: limitedAssetIds,
        photo_selection_method: 'ai',
        status: 'draft'
      })
      .select('id')
      .single()

    if (limitedBookError) {
      console.error('Error creating limited test memory book:', limitedBookError)
      throw limitedBookError
    }

    const limitedBookId = limitedBook.id

    try {
      // Generate first version
      const firstResponse = await fetch('http://localhost:3000/api/ai/magic-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          memoryBookId: limitedBookId,
          userId: testUserId,
          photoCount: 2
        })
      })

      expect(firstResponse.ok).toBe(true)

      // Reset for regeneration
      await fetch('http://localhost:3000/api/memory-books/reset-for-regeneration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          bookId: limitedBookId
        })
      })

      // Try to generate second version - should fail gracefully
      const secondResponse = await fetch('http://localhost:3000/api/ai/magic-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          memoryBookId: limitedBookId,
          userId: testUserId,
          photoCount: 2
        })
      })

      // Should fail because all photos were used previously
      expect(secondResponse.ok).toBe(false)
      const secondResult = await secondResponse.json()
      expect(secondResult.statusMessage).toContain('No photos available for selection after excluding previously used photos')

    } finally {
      // Clean up limited book
      await supabase.from('memory_books').delete().eq('id', limitedBookId)
    }
  })
})
