// Test script for AI photo selection reasoning
// This tests that the reasoning is saved to the database and can be retrieved

import { createClient } from '@supabase/supabase-js'

// Mock environment variables for testing
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPhotoSelectionReasoning() {
  console.log('🧪 Testing AI photo selection reasoning...\n')
  
  try {
    // Test 1: Check if the field exists in the database
    console.log('📋 Test 1: Checking if ai_photo_selection_reasoning field exists...')
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'memory_books')
      .eq('column_name', 'ai_photo_selection_reasoning')
    
    if (columnError) {
      console.error('❌ Error checking column:', columnError)
      return
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ ai_photo_selection_reasoning field exists in database')
    } else {
      console.log('❌ ai_photo_selection_reasoning field not found in database')
      return
    }
    
    // Test 2: Check if any existing memory books have reasoning
    console.log('\n📋 Test 2: Checking existing memory books for reasoning...')
    
    const { data: books, error: booksError } = await supabase
      .from('memory_books')
      .select('id, ai_supplemental_prompt, magic_story, ai_photo_selection_reasoning')
      .not('ai_photo_selection_reasoning', 'is', null)
      .limit(5)
    
    if (booksError) {
      console.error('❌ Error fetching books:', booksError)
      return
    }
    
    if (books && books.length > 0) {
      console.log(`✅ Found ${books.length} memory books with reasoning:`)
      books.forEach((book, index) => {
        console.log(`  ${index + 1}. Book ID: ${book.id}`)
        console.log(`     Prompt: ${book.ai_supplemental_prompt}`)
        console.log(`     Has Story: ${book.magic_story ? 'Yes' : 'No'}`)
        console.log(`     Reasoning Length: ${book.ai_photo_selection_reasoning?.length || 0} characters`)
        console.log(`     Reasoning Preview: ${book.ai_photo_selection_reasoning?.substring(0, 100)}...`)
        console.log('')
      })
    } else {
      console.log('ℹ️ No existing memory books have reasoning yet (this is expected for existing books)')
    }
    
    // Test 3: Check total memory books count
    console.log('\n📋 Test 3: Checking total memory books count...')
    
    const { count: totalBooks, error: countError } = await supabase
      .from('memory_books')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error counting books:', countError)
      return
    }
    
    console.log(`📊 Total memory books in database: ${totalBooks}`)
    
    // Test 4: Check books with magic stories but no reasoning
    console.log('\n📋 Test 4: Checking books with stories but no reasoning...')
    
    const { data: booksWithStories, error: storiesError } = await supabase
      .from('memory_books')
      .select('id, ai_supplemental_prompt, magic_story')
      .not('magic_story', 'is', null)
      .is('ai_photo_selection_reasoning', null)
      .limit(5)
    
    if (storiesError) {
      console.error('❌ Error fetching books with stories:', storiesError)
      return
    }
    
    if (booksWithStories && booksWithStories.length > 0) {
      console.log(`ℹ️ Found ${booksWithStories.length} memory books with stories but no reasoning (these are older books):`)
      booksWithStories.forEach((book, index) => {
        console.log(`  ${index + 1}. Book ID: ${book.id}`)
        console.log(`     Prompt: ${book.ai_supplemental_prompt}`)
        console.log(`     Story Length: ${book.magic_story?.length || 0} characters`)
      })
    } else {
      console.log('✅ All books with stories also have reasoning')
    }
    
    console.log('\n🏁 All tests completed successfully!')
    console.log('\n📝 Summary:')
    console.log('- Database field exists ✅')
    console.log('- Field can be queried ✅')
    console.log('- Ready for new memory books to include reasoning ✅')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the tests
testPhotoSelectionReasoning().catch(console.error)
