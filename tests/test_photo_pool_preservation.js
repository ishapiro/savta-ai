// Test to verify that the full photo selection pool is preserved during memory book recreation
// This ensures that we don't accidentally modify the photo_selection_pool when recreating

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseKey)

describe('Photo Selection Pool Preservation', () => {
  let testUserId
  let testBookId
  let testAssetIds = []

  beforeAll(async () => {
    // Create a test user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: 'test-pool-preservation@example.com',
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
        title: 'Pool Test Photo 1',
        ai_caption: 'First test photo',
        tags: ['test'],
        approved: true
      },
      {
        user_id: testUserId,
        type: 'photo',
        title: 'Pool Test Photo 2',
        ai_caption: 'Second test photo',
        tags: ['test'],
        approved: true
      },
      {
        user_id: testUserId,
        type: 'photo',
        title: 'Pool Test Photo 3',
        ai_caption: 'Third test photo',
        tags: ['test'],
        approved: true
      },
      {
        user_id: testUserId,
        type: 'photo',
        title: 'Pool Test Photo 4',
        ai_caption: 'Fourth test photo',
        tags: ['test'],
        approved: true
      },
      {
        user_id: testUserId,
        type: 'photo',
        title: 'Pool Test Photo 5',
        ai_caption: 'Fifth test photo',
        tags: ['test'],
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

    // Create a test memory book with all 5 photos in the pool
    const { data: book, error: bookError } = await supabase
      .from('memory_books')
      .insert({
        user_id: testUserId,
        ai_supplemental_prompt: 'Pool preservation test',
        photo_selection_pool: testAssetIds, // All 5 photos in the pool
        photo_selection_method: 'ai',
        status: 'draft'
      })
      .select('id, photo_selection_pool')
      .single()

    if (bookError) {
      console.error('Error creating test memory book:', bookError)
      throw bookError
    }

    testBookId = book.id
    console.log('📸 Initial photo selection pool:', book.photo_selection_pool)
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

  it('should preserve the full photo selection pool during recreation', async () => {
    // Step 1: Generate the first version of the memory book
    console.log('🎯 Step 1: Generating first version...')
    
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

    // Step 2: Verify photo selection pool is still intact after first generation
    const { data: bookAfterFirst, error: firstBookError } = await supabase
      .from('memory_books')
      .select('photo_selection_pool, created_from_assets, previously_used_assets')
      .eq('id', testBookId)
      .single()

    expect(firstBookError).toBeNull()
    expect(bookAfterFirst.photo_selection_pool).toEqual(testAssetIds) // Pool should be unchanged
    expect(bookAfterFirst.created_from_assets).toHaveLength(2) // Should have 2 selected photos
    expect(bookAfterFirst.previously_used_assets).toEqual([]) // Should be empty initially

    console.log('✅ Photo selection pool preserved after first generation:', bookAfterFirst.photo_selection_pool)

    // Step 3: Reset the book for regeneration
    console.log('🔄 Step 3: Resetting book for regeneration...')
    
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

    // Step 4: Verify photo selection pool is still intact after reset
    const { data: bookAfterReset, error: resetBookError } = await supabase
      .from('memory_books')
      .select('photo_selection_pool, created_from_assets, previously_used_assets')
      .eq('id', testBookId)
      .single()

    expect(resetBookError).toBeNull()
    expect(bookAfterReset.photo_selection_pool).toEqual(testAssetIds) // Pool should still be unchanged
    expect(bookAfterReset.created_from_assets).toBeNull() // Should be cleared
    expect(bookAfterReset.previously_used_assets).toEqual(firstResult.selected_photo_ids) // Should contain previously used photos

    console.log('✅ Photo selection pool preserved after reset:', bookAfterReset.photo_selection_pool)
    console.log('📸 Previously used assets stored:', bookAfterReset.previously_used_assets)

    // Step 5: Generate the second version of the memory book
    console.log('🎯 Step 5: Generating second version...')
    
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

    // Step 6: Verify photo selection pool is still intact after second generation
    const { data: bookAfterSecond, error: secondBookError } = await supabase
      .from('memory_books')
      .select('photo_selection_pool, created_from_assets, previously_used_assets')
      .eq('id', testBookId)
      .single()

    expect(secondBookError).toBeNull()
    expect(bookAfterSecond.photo_selection_pool).toEqual(testAssetIds) // Pool should still be unchanged
    expect(bookAfterSecond.created_from_assets).toHaveLength(2) // Should have 2 new selected photos
    expect(bookAfterSecond.previously_used_assets).toEqual(firstResult.selected_photo_ids) // Should still contain previously used photos

    console.log('✅ Photo selection pool preserved after second generation:', bookAfterSecond.photo_selection_pool)
    console.log('📸 New selected assets:', bookAfterSecond.created_from_assets)

    // Step 7: Verify that different photos were selected
    const firstPhotoIds = firstResult.selected_photo_ids
    const secondPhotoIds = secondResult.selected_photo_ids
    
    const hasDifferentPhotos = firstPhotoIds.some(id => !secondPhotoIds.includes(id)) ||
                               secondPhotoIds.some(id => !firstPhotoIds.includes(id))
    
    expect(hasDifferentPhotos).toBe(true)
    console.log('🎉 Success: Different photos selected while preserving full pool!')

    // Step 8: Verify the reasoning mentions using different photos
    expect(secondResult.reasoning).toContain('Using different photos from the previous version')
  })

  it('should handle manual photo selection without affecting the pool', async () => {
    // Create a book with manual photo selection
    const { data: manualBook, error: manualBookError } = await supabase
      .from('memory_books')
      .insert({
        user_id: testUserId,
        ai_supplemental_prompt: 'Manual selection test',
        photo_selection_pool: testAssetIds,
        photo_selection_method: 'photo_library', // Manual selection
        status: 'draft'
      })
      .select('id, photo_selection_pool')
      .single()

    if (manualBookError) {
      console.error('Error creating manual selection test book:', manualBookError)
      throw manualBookError
    }

    const manualBookId = manualBook.id

    try {
      // Generate with manual selection
      const manualResponse = await fetch('http://localhost:3000/api/ai/magic-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          memoryBookId: manualBookId,
          userId: testUserId,
          photoCount: 3
        })
      })

      expect(manualResponse.ok).toBe(true)
      const manualResult = await manualResponse.json()
      expect(manualResult.success).toBe(true)
      expect(manualResult.selected_photo_ids).toHaveLength(5) // Should use all photos in manual mode

      // Verify pool is preserved
      const { data: manualBookAfter, error: manualBookAfterError } = await supabase
        .from('memory_books')
        .select('photo_selection_pool, created_from_assets')
        .eq('id', manualBookId)
        .single()

      expect(manualBookAfterError).toBeNull()
      expect(manualBookAfter.photo_selection_pool).toEqual(testAssetIds) // Pool should be unchanged
      expect(manualBookAfter.created_from_assets).toHaveLength(5) // Should have all photos selected

      console.log('✅ Manual selection preserves photo selection pool')

    } finally {
      // Clean up manual book
      await supabase.from('memory_books').delete().eq('id', manualBookId)
    }
  })
})
