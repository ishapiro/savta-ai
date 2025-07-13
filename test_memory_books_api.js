// Test script to check memory books API
// Run this in the browser console on the memory-books page

// Test 1: Check if Supabase client is working
console.log('Testing Supabase client...')
const supabase = useNuxtApp().$supabase
console.log('Supabase client:', supabase)

// Test 2: Check if user is authenticated (using plugin)
console.log('Testing user authentication...')
const { $supabase } = useNuxtApp()
const { data: { user } } = await $supabase.auth.getUser()
console.log('Current user:', user)

// Test 3: Test direct Supabase query
async function testDirectQuery() {
  try {
    console.log('Testing direct Supabase query...')
    const { data, error } = await supabase
      .from('memory_books')
      .select('*')
      .eq('user_id', user?.id)
      .eq('deleted', false)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Direct query error:', error)
      return false
    }
    
    console.log('Direct query success:', data)
    return true
  } catch (err) {
    console.error('Direct query exception:', err)
    return false
  }
}

// Test 4: Test database composable
async function testDatabaseComposable() {
  try {
    console.log('Testing database composable...')
    const db = useDatabase()
    const books = await db.memoryBooks.getMemoryBooks()
    console.log('Database composable success:', books)
    return true
  } catch (err) {
    console.error('Database composable error:', err)
    return false
  }
}

// Test 5: Check if useDatabase is available
function testDatabaseComposableExists() {
  try {
    console.log('Testing if useDatabase exists...')
    const db = useDatabase()
    console.log('useDatabase exists:', !!db)
    console.log('useDatabase methods:', Object.keys(db))
    return true
  } catch (err) {
    console.error('useDatabase not available:', err)
    return false
  }
}

// Run tests
async function runTests() {
  console.log('=== Starting Memory Books API Tests ===')
  
  const dbExists = testDatabaseComposableExists()
  console.log('Database composable exists:', dbExists)
  
  if (dbExists) {
    const directQueryResult = await testDirectQuery()
    console.log('Direct query result:', directQueryResult)
    
    const composableResult = await testDatabaseComposable()
    console.log('Composable result:', composableResult)
  }
  
  console.log('=== Tests Complete ===')
}

// Run the tests
runTests() 