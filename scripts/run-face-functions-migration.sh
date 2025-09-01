#!/bin/bash

# Face Similarity Functions Migration Script
# This script adds optimized database functions for face similarity search

echo "🚀 Starting Face Similarity Functions Migration..."
echo "=================================================="

# Check if susql alias exists
if ! command -v susql &> /dev/null; then
    echo "❌ Error: 'susql' alias not found. Please ensure it's configured."
    echo "   You can set it up by running: alias susql='psql $DATABASE_URL'"
    exit 1
fi

echo "📊 Running face similarity functions migration..."
echo "   This will:"
echo "   - Create optimized vector similarity search functions"
echo "   - Add person statistics and management functions"
echo "   - Set up face assignment suggestion functions"
echo "   - Configure proper permissions for all functions"
echo ""

# Run the migration
susql << 'EOF'
-- Run the face similarity functions migration
\i supabase/face_similarity_functions.sql
EOF

if [ $? -eq 0 ]; then
    echo "✅ Face similarity functions migration completed successfully!"
    echo ""
    echo "🔍 Verifying functions were created..."
    
    # Verify the functions exist
    susql << 'EOF'
    SELECT 
        routine_name,
        routine_type,
        CASE 
            WHEN routine_name IN ('find_similar_faces', 'find_faces_by_person', 'get_person_statistics', 'find_unassigned_faces', 'get_face_detection_stats', 'suggest_person_assignments') 
            THEN '✅ Created' 
            ELSE '❌ Missing' 
        END as status
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('find_similar_faces', 'find_faces_by_person', 'get_person_statistics', 'find_unassigned_faces', 'get_face_detection_stats', 'suggest_person_assignments')
    ORDER BY routine_name;
EOF

    echo ""
    echo "🔍 Checking function permissions..."
    susql << 'EOF'
    SELECT 
        routine_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.role_routine_grants 
                WHERE routine_name = r.routine_name 
                AND grantee = 'authenticated'
            ) THEN '✅ Permissions granted' 
            ELSE '❌ Permissions missing' 
        END as permissions
    FROM information_schema.routines r
    WHERE routine_schema = 'public' 
    AND routine_name IN ('find_similar_faces', 'find_faces_by_person', 'get_person_statistics', 'find_unassigned_faces', 'get_face_detection_stats', 'suggest_person_assignments');
EOF

    echo ""
    echo "🎉 Face Similarity Functions Migration Complete!"
    echo ""
    echo "📋 Available Functions:"
    echo "   • find_similar_faces() - Vector similarity search"
    echo "   • find_faces_by_person() - Get faces for a person"
    echo "   • get_person_statistics() - Person analytics"
    echo "   • find_unassigned_faces() - Unassigned face discovery"
    echo "   • get_face_detection_stats() - Overall statistics"
    echo "   • suggest_person_assignments() - AI assignment suggestions"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test the new API endpoints"
    echo "   2. Implement Phase 3: Local Face Matching Engine"
    echo "   3. Add UI components for person management"
    echo "   4. Test face similarity search functionality"
    
else
    echo "❌ Migration failed! Please check the error messages above."
    exit 1
fi
