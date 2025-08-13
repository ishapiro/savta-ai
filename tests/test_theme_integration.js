// Test script to verify theme integration
const { createClient } = require('@supabase/supabase-js')

// You'll need to set these environment variables or replace with actual values
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testThemeIntegration() {
  try {
    console.log('Testing theme integration...')
    
    // First, let's create a test theme
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .insert([
        {
          name: 'Test Theme',
          description: 'A test theme for verification',
          background_color: '#f0f0f0',
          header_font: 'Arial',
          body_font: 'Times New Roman',
          signature_font: 'Cursive',
          header_font_color: '#333333',
          body_font_color: '#666666',
          signature_font_color: '#999999',
          layout_config: { photoCount: 4 },
          rounded: true,
          size: '8.5x11',
          card_wizard: true,
          is_active: true
        }
      ])
      .select()
      .single()
    
    if (themeError) {
      console.error('Error creating test theme:', themeError)
      return
    }
    
    console.log('Created test theme:', theme)
    
    // Now create a test memory book with this theme
    const { data: memoryBook, error: bookError } = await supabase
      .from('memory_books')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
          ai_supplemental_prompt: 'Test Memory Book',
          theme: theme.id,
          status: 'draft',
          layout_type: 'grid',
          created_from_assets: []
        }
      ])
      .select()
      .single()
    
    if (bookError) {
      console.error('Error creating test memory book:', bookError)
      return
    }
    
    console.log('Created test memory book:', memoryBook)
    
    // Now test the theme retrieval logic
    const { data: books, error: booksError } = await supabase
      .from('memory_books')
      .select('*')
      .eq('id', memoryBook.id)
    
    if (booksError) {
      console.error('Error fetching memory books:', booksError)
      return
    }
    
    console.log('Fetched memory books:', books)
    
    // Apply the theme retrieval logic
    if (books && books.length > 0) {
      const booksWithThemes = books.filter(book => book.theme_id)
      if (booksWithThemes.length > 0) {
        const themeIds = [...new Set(booksWithThemes.map(book => book.theme_id))]
        
        console.log('Theme IDs found:', themeIds)
        
        const { data: themesData, error: themesError } = await supabase
          .from('themes')
          .select('id, name, description, background_color, header_font, body_font, signature_font, header_font_color, body_font_color, signature_font_color, layout_config, rounded, size')
          .in('id', themeIds)
        
        if (!themesError && themesData) {
          const themesMap = themesData.reduce((acc, theme) => {
            acc[theme.id] = theme
            return acc
          }, {})
          
          console.log('Themes map:', themesMap)
          
          // Attach theme data to memory books
          books.forEach(book => {
            if (book.theme_id && themesMap[book.theme_id]) {
              book.theme = themesMap[book.theme_id]
              console.log(`Book ${book.id} now has theme:`, book.theme.name)
            }
          })
        }
      }
    }
    
    console.log('Test completed successfully!')
    
    // Clean up test data
    await supabase.from('memory_books').delete().eq('id', memoryBook.id)
    await supabase.from('themes').delete().eq('id', theme.id)
    
    console.log('Test data cleaned up')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testThemeIntegration() 