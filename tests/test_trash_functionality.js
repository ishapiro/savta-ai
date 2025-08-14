// Test script for trash functionality
// This script tests the basic trash operations

const testTrashFunctionality = async () => {
  console.log('🧪 Testing Trash Functionality...')
  
  try {
    // Test 1: Check if deleted_at column exists
    console.log('\n📋 Test 1: Checking deleted_at column...')
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'memory_books')
      .eq('column_name', 'deleted_at')
    
    if (columns && columns.length > 0) {
      console.log('✅ deleted_at column exists')
    } else {
      console.log('❌ deleted_at column not found')
      return false
    }
    
    // Test 2: Check if we can query deleted books
    console.log('\n📋 Test 2: Testing deleted books query...')
    const { data: deletedBooks, error } = await supabase
      .from('memory_books')
      .select('id, ai_supplemental_prompt, deleted, deleted_at')
      .eq('deleted', true)
      .limit(5)
    
    if (error) {
      console.log('❌ Error querying deleted books:', error.message)
      return false
    }
    
    console.log(`✅ Found ${deletedBooks?.length || 0} deleted books`)
    if (deletedBooks && deletedBooks.length > 0) {
      console.log('📝 Sample deleted book:', {
        id: deletedBooks[0].id,
        title: deletedBooks[0].ai_supplemental_prompt,
        deleted: deletedBooks[0].deleted,
        deleted_at: deletedBooks[0].deleted_at
      })
    }
    
    // Test 3: Check if we can query non-deleted books
    console.log('\n📋 Test 3: Testing non-deleted books query...')
    const { data: activeBooks, error: activeError } = await supabase
      .from('memory_books')
      .select('id, ai_supplemental_prompt, deleted')
      .eq('deleted', false)
      .limit(5)
    
    if (activeError) {
      console.log('❌ Error querying active books:', activeError.message)
      return false
    }
    
    console.log(`✅ Found ${activeBooks?.length || 0} active books`)
    
    console.log('\n🎉 All trash functionality tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Export for use in other test files
export { testTrashFunctionality }

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('🧪 Running trash functionality tests...')
  // Note: This would need to be run with proper Supabase client setup
}
