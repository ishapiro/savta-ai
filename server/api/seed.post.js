// Seed API endpoint for populating database with sample data
// This is for development/testing purposes only

export default defineEventHandler(async (event) => {
  try {
    const supabase = useSupabaseClient()
    
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'production') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Seeding is not allowed in production'
      })
    }

    // Sample users data
    const sampleUsers = [
      {
        email: 'admin@savta.ai',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        subscription_type: 'premium'
      },
      {
        email: 'editor@savta.ai',
        first_name: 'Editor',
        last_name: 'User',
        role: 'editor',
        subscription_type: 'premium'
      },
      {
        email: 'user@savta.ai',
        first_name: 'Regular',
        last_name: 'User',
        role: 'user',
        subscription_type: 'regular'
      }
    ]

    // Sample families data
    const sampleFamilies = [
      {
        name: 'The Smith Family',
        relationship: 'grandchildren',
        delivery_method: 'email',
        frequency: 'monthly'
      },
      {
        name: 'The Johnson Family',
        relationship: 'children',
        delivery_method: 'print',
        frequency: 'quarterly'
      }
    ]

    // Sample memory preferences
    const samplePreferences = [
      {
        layout_type: 'modern',
        page_count: 25,
        print_size: 'a4',
        quality: 'premium',
        medium: 'both'
      },
      {
        layout_type: 'vintage',
        page_count: 30,
        print_size: 'letter',
        quality: 'standard',
        medium: 'digital'
      }
    ]

    // Sample assets data
    const sampleAssets = [
      {
        type: 'photo',
        user_caption: 'Family vacation at the beach',
        ai_caption: 'A beautiful family moment captured during our beach vacation. The kids are building sandcastles while grandma watches with joy.',
        tags: ['family', 'vacation', 'beach', 'summer'],
        people_detected: ['grandma', 'kids', 'parents'],
        ai_processed: true,
        approved: true
      },
      {
        type: 'photo',
        user_caption: 'Birthday celebration',
        ai_caption: 'A heartwarming birthday celebration with the whole family gathered around the cake. Everyone is smiling and laughing.',
        tags: ['family', 'birthday', 'celebration', 'cake'],
        people_detected: ['grandma', 'grandpa', 'kids', 'parents'],
        ai_processed: true,
        approved: true
      },
      {
        type: 'text',
        user_caption: 'Grandma\'s Recipe',
        ai_caption: 'A precious family story about grandma\'s famous recipe that has been passed down through generations.',
        tags: ['family', 'recipe', 'tradition', 'grandma'],
        people_detected: [],
        ai_processed: true,
        approved: true
      },
      {
        type: 'photo',
        user_caption: 'Holiday dinner',
        ai_caption: 'A cozy holiday dinner with the family gathered around the table, sharing stories and creating memories.',
        tags: ['family', 'holiday', 'dinner', 'togetherness'],
        people_detected: ['grandma', 'grandpa', 'kids', 'parents'],
        ai_processed: true,
        approved: false
      }
    ]

    // Sample memory books
    const sampleMemoryBooks = [
      {
        status: 'ready',
        review_notes: 'Generated from 3 approved assets',
        created_from_assets: ['asset1', 'asset2', 'asset3'],
        generated_at: new Date().toISOString()
      },
      {
        status: 'draft',
        review_notes: 'New memory book in progress',
        created_from_assets: [],
        generated_at: null
      }
    ]

    // Sample activity log entries
    const sampleActivities = [
      {
        action: 'profile_created',
        details: { email: 'user@savta.ai' }
      },
      {
        action: 'asset_uploaded',
        details: { assetId: 'asset1', type: 'photo' }
      },
      {
        action: 'asset_approved',
        details: { assetId: 'asset1', approved: true }
      },
      {
        action: 'memory_book_created',
        details: { bookId: 'book1', assetCount: 3 }
      }
    ]

    // Insert sample data
    const results = {
      users: [],
      families: [],
      preferences: [],
      assets: [],
      memoryBooks: [],
      activities: []
    }

    // Note: In a real implementation, you would:
    // 1. Create actual user accounts in Supabase Auth
    // 2. Insert profiles for those users
    // 3. Insert families, preferences, assets, etc.
    // 4. Link everything properly with user IDs

    // For now, we'll just return the sample data structure
    console.log('Sample data structure created for development')

    return {
      success: true,
      message: 'Sample data structure created. In production, this would insert actual data into the database.',
      sampleData: {
        users: sampleUsers,
        families: sampleFamilies,
        preferences: samplePreferences,
        assets: sampleAssets,
        memoryBooks: sampleMemoryBooks,
        activities: sampleActivities
      }
    }

  } catch (error) {
    console.error('Seeding error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Seeding failed'
    })
  }
}) 