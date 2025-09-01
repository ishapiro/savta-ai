#!/bin/bash

# Face Recognition Migration Script
# This script runs the migration to add face recognition tables and pgvector support

echo "🚀 Starting Face Recognition Migration..."
echo "========================================"

# Check if susql alias exists
if ! command -v susql &> /dev/null; then
    echo "❌ Error: 'susql' alias not found. Please ensure it's configured."
    echo "   You can set it up by running: alias susql='psql $DATABASE_URL'"
    exit 1
fi

echo "📊 Running migration script..."
echo "   This will:"
echo "   - Enable pgvector extension"
echo "   - Create face recognition tables"
echo "   - Set up indexes and constraints"
echo "   - Configure RLS policies"
echo ""

# Run the migration
susql << 'EOF'
-- Run the face recognition migration
\i supabase/add_face_recognition_tables.sql
EOF

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🔍 Verifying tables were created..."
    
    # Verify the tables exist
    susql << 'EOF'
    SELECT 
        table_name,
        CASE 
            WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) 
            THEN '✅ Created' 
            ELSE '❌ Missing' 
        END as status
    FROM (VALUES 
        ('face_collections'),
        ('faces'),
        ('person_groups'),
        ('face_person_links'),
        ('face_similarities'),
        ('face_processing_queue')
    ) AS t(table_name);
EOF

    echo ""
    echo "🔍 Checking pgvector extension..."
    susql << 'EOF'
    SELECT 
        extname,
        extversion,
        CASE 
            WHEN extname = 'vector' THEN '✅ Enabled' 
            ELSE '❌ Not found' 
        END as status
    FROM pg_extension 
    WHERE extname = 'vector';
EOF

    echo ""
    echo "🎉 Face Recognition Migration Complete!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test the new tables with sample data"
    echo "   2. Implement Phase 2: Enhanced Face Detection API"
    echo "   3. Add face collection management endpoints"
    echo "   4. Test vector similarity search functionality"
    
else
    echo "❌ Migration failed! Please check the error messages above."
    exit 1
fi
