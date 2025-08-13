// Test script to verify theme data retrieval
const { createClient } = require('@supabase/supabase-js')

// You'll need to set these environment variables or replace with actual values
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testThemeRetrieval() {
  try {
    console.log('Testing theme data retrieval...')
    
    // First, let's check what themes exist
    const { data: themes, error: themesError } = await supabase
      .from('themes')
      .select('id, name, description')
      .eq('deleted', false)
      .limit(5)
    
    if (themesError) {
      console.error('Error fetching themes:', themesError)
      return
    }
    
    console.log('Available themes:', themes)
    
    // Now let's check memory books with themes
    const { data: memoryBooks, error: booksError } = await supabase
      .from('memory_books')
      .select('id, title, theme, created_at')
      .not('theme', 'is', null)
      .limit(5)
    
    if (booksError) {
      console.error('Error fetching memory books:', booksError)
      return
    }
    
    console.log('Memory books with themes:', memoryBooks)
    
    // Test the theme retrieval logic
    if (memoryBooks && memoryBooks.length > 0) {
      const booksWithThemes = memoryBooks.filter(book => book.theme_id)
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
          memoryBooks.forEach(book => {
            if (book.theme_id && themesMap[book.theme_id]) {
              book.theme = themesMap[book.theme_id]
              console.log(`Book ${book.id} now has theme:`, book.theme.name)
            }
          })
        }
      }
    }
    
    console.log('Test completed successfully!')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testThemeRetrieval() 