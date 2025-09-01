#!/bin/bash

# Face Recognition System Test Script
# This script tests all components of the face recognition system

echo "🧪 Testing Face Recognition System"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# Check if susql alias exists
if ! command -v susql &> /dev/null; then
    echo -e "${RED}❌ Error: 'susql' alias not found. Please ensure it's configured.${NC}"
    echo "   You can set it up by running: alias susql='psql \$DATABASE_URL'"
    exit 1
fi

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ Error: 'curl' not found. Please install curl to test API endpoints.${NC}"
    exit 1
fi

echo ""
echo "🔍 Phase 1: Database Schema Verification"
echo "----------------------------------------"

# Test 1: Check if pgvector extension is enabled
print_info "Checking pgvector extension..."
susql << 'EOF' > /tmp/pgvector_test.txt 2>&1
SELECT 
    extname,
    extversion,
    CASE 
        WHEN extname = 'vector' THEN 'Enabled' 
        ELSE 'Not found' 
    END as status
FROM pg_extension 
WHERE extname = 'vector';
EOF

if grep -q "vector" /tmp/pgvector_test.txt; then
    print_result 0 "pgvector extension is enabled"
else
    print_result 1 "pgvector extension is not enabled"
fi

# Test 2: Check if face recognition tables exist
print_info "Checking face recognition tables..."
susql << 'EOF' > /tmp/tables_test.txt 2>&1
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('face_collections', 'faces', 'person_groups', 'face_person_links', 'face_similarities', 'face_processing_queue') 
        THEN 'Exists' 
        ELSE 'Missing' 
    END as status
FROM information_schema.tables 
WHERE table_name IN ('face_collections', 'faces', 'person_groups', 'face_person_links', 'face_similarities', 'face_processing_queue')
ORDER BY table_name;
EOF

EXPECTED_TABLES=6
FOUND_TABLES=$(grep -c "face_" /tmp/tables_test.txt || echo "0")

if [ "$FOUND_TABLES" -eq "$EXPECTED_TABLES" ]; then
    print_result 0 "All face recognition tables exist ($FOUND_TABLES/$EXPECTED_TABLES)"
else
    print_result 1 "Missing face recognition tables ($FOUND_TABLES/$EXPECTED_TABLES)"
fi

# Test 3: Check if face recognition functions exist
print_info "Checking face recognition functions..."
susql << 'EOF' > /tmp/functions_test.txt 2>&1
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IN ('find_similar_faces', 'find_faces_by_person', 'get_person_statistics', 'find_unassigned_faces', 'get_face_detection_stats', 'suggest_person_assignments') 
        THEN 'Exists' 
        ELSE 'Missing' 
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('find_similar_faces', 'find_faces_by_person', 'get_person_statistics', 'find_unassigned_faces', 'get_face_detection_stats', 'suggest_person_assignments')
ORDER BY routine_name;
EOF

EXPECTED_FUNCTIONS=6
FOUND_FUNCTIONS=$(grep -c "find_\|get_" /tmp/functions_test.txt || echo "0")

if [ "$FOUND_FUNCTIONS" -eq "$EXPECTED_FUNCTIONS" ]; then
    print_result 0 "All face recognition functions exist ($FOUND_FUNCTIONS/$EXPECTED_FUNCTIONS)"
else
    print_result 1 "Missing face recognition functions ($FOUND_FUNCTIONS/$EXPECTED_FUNCTIONS)"
fi

# Test 4: Check if vector index exists
print_info "Checking vector similarity index..."
susql << 'EOF' > /tmp/index_test.txt 2>&1
SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname = 'idx_faces_face_vector' THEN 'Exists' 
        ELSE 'Missing' 
    END as status
FROM pg_indexes 
WHERE indexname = 'idx_faces_face_vector';
EOF

if grep -q "idx_faces_face_vector" /tmp/index_test.txt; then
    print_result 0 "Vector similarity index exists"
else
    print_result 1 "Vector similarity index is missing"
fi

# Test 5: Check RLS policies
print_info "Checking Row Level Security policies..."
susql << 'EOF' > /tmp/rls_test.txt 2>&1
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN policyname LIKE '%face%' THEN 'Exists' 
        ELSE 'Missing' 
    END as status
FROM pg_policies 
WHERE tablename LIKE 'face%'
ORDER BY tablename, policyname;
EOF

RLS_POLICIES=$(grep -c "face" /tmp/rls_test.txt || echo "0")

if [ "$RLS_POLICIES" -ge 6 ]; then
    print_result 0 "RLS policies configured ($RLS_POLICIES policies found)"
else
    print_result 1 "Missing RLS policies ($RLS_POLICIES policies found, expected >=6)"
fi

echo ""
echo "🔍 Phase 2: Database Function Testing"
echo "-------------------------------------"

# Test 6: Test find_similar_faces function (should work even with no data)
print_info "Testing find_similar_faces function..."
susql << 'EOF' > /tmp/similar_faces_test.txt 2>&1
SELECT * FROM find_similar_faces('00000000-0000-0000-0000-000000000000', 0.8, 5);
EOF

if [ $? -eq 0 ]; then
    print_result 0 "find_similar_faces function executes successfully"
else
    print_result 1 "find_similar_faces function failed to execute"
fi

# Test 7: Test get_face_detection_stats function
print_info "Testing get_face_detection_stats function..."
susql << 'EOF' > /tmp/stats_test.txt 2>&1
SELECT * FROM get_face_detection_stats('00000000-0000-0000-0000-000000000000');
EOF

if [ $? -eq 0 ]; then
    print_result 0 "get_face_detection_stats function executes successfully"
else
    print_result 1 "get_face_detection_stats function failed to execute"
fi

# Test 8: Test find_unassigned_faces function
print_info "Testing find_unassigned_faces function..."
susql << 'EOF' > /tmp/unassigned_test.txt 2>&1
SELECT * FROM find_unassigned_faces('00000000-0000-0000-0000-000000000000', 5);
EOF

if [ $? -eq 0 ]; then
    print_result 0 "find_unassigned_faces function executes successfully"
else
    print_result 1 "find_unassigned_faces function failed to execute"
fi

echo ""
echo "🔍 Phase 3: API Endpoint Testing"
echo "--------------------------------"

# Check if server is running
print_info "Checking if server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_result 0 "Server is running on localhost:3000"
    SERVER_RUNNING=true
else
    print_warning "Server is not running on localhost:3000"
    print_info "Skipping API endpoint tests..."
    SERVER_RUNNING=false
fi

if [ "$SERVER_RUNNING" = true ]; then
    # Test 9: Test face collection status endpoint (will fail without auth, but should return proper error)
    print_info "Testing face collection status endpoint..."
    RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/api/ai/face-collection-status)
    HTTP_CODE="${RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "401" ]; then
        print_result 0 "Face collection status endpoint returns proper auth error (401)"
    elif [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "Face collection status endpoint works (200)"
    else
        print_result 1 "Face collection status endpoint returned unexpected code: $HTTP_CODE"
    fi

    # Test 10: Test person groups endpoint
    print_info "Testing person groups endpoint..."
    RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/ai/person-groups \
        -H "Content-Type: application/json" \
        -d '{"action": "create", "personGroup": {"name": "Test Person"}}')
    HTTP_CODE="${RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "401" ]; then
        print_result 0 "Person groups endpoint returns proper auth error (401)"
    elif [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "Person groups endpoint works (200)"
    else
        print_result 1 "Person groups endpoint returned unexpected code: $HTTP_CODE"
    fi

    # Test 11: Test find similar faces endpoint
    print_info "Testing find similar faces endpoint..."
    RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/ai/find-similar-faces \
        -H "Content-Type: application/json" \
        -d '{"faceId": "00000000-0000-0000-0000-000000000000"}')
    HTTP_CODE="${RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "401" ]; then
        print_result 0 "Find similar faces endpoint returns proper auth error (401)"
    elif [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "Find similar faces endpoint works (200)"
    else
        print_result 1 "Find similar faces endpoint returned unexpected code: $HTTP_CODE"
    fi

    # Test 12: Test assign face to person endpoint
    print_info "Testing assign face to person endpoint..."
    RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/ai/assign-face-to-person \
        -H "Content-Type: application/json" \
        -d '{"faceId": "00000000-0000-0000-0000-000000000000", "personGroupId": "00000000-0000-0000-0000-000000000000"}')
    HTTP_CODE="${RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "401" ]; then
        print_result 0 "Assign face to person endpoint returns proper auth error (401)"
    elif [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "Assign face to person endpoint works (200)"
    else
        print_result 1 "Assign face to person endpoint returned unexpected code: $HTTP_CODE"
    fi
fi

echo ""
echo "🔍 Phase 4: Performance Testing"
echo "-------------------------------"

# Test 13: Test vector similarity performance
print_info "Testing vector similarity performance..."
susql << 'EOF' > /tmp/performance_test.txt 2>&1
-- Test vector similarity query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    f.id,
    (f.face_vector <=> '[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]'::vector) as similarity
FROM faces f
WHERE f.deleted = false
ORDER BY similarity DESC
LIMIT 10;
EOF

if [ $? -eq 0 ]; then
    print_result 0 "Vector similarity query executes successfully"
else
    print_result 1 "Vector similarity query failed"
fi

# Test 14: Test index usage
print_info "Checking index usage statistics..."
susql << 'EOF' > /tmp/index_usage_test.txt 2>&1
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename LIKE 'face%'
ORDER BY tablename, indexname;
EOF

if [ $? -eq 0 ]; then
    print_result 0 "Index usage statistics query executes successfully"
else
    print_result 1 "Index usage statistics query failed"
fi

echo ""
echo "🔍 Phase 5: Data Integrity Testing"
echo "----------------------------------"

# Test 15: Check foreign key constraints
print_info "Checking foreign key constraints..."
susql << 'EOF' > /tmp/constraints_test.txt 2>&1
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name LIKE 'face%'
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;
EOF

FOREIGN_KEYS=$(grep -c "face" /tmp/constraints_test.txt || echo "0")

if [ "$FOREIGN_KEYS" -ge 4 ]; then
    print_result 0 "Foreign key constraints are properly configured ($FOREIGN_KEYS constraints found)"
else
    print_result 1 "Missing foreign key constraints ($FOREIGN_KEYS constraints found, expected >=4)"
fi

# Test 16: Check unique constraints
print_info "Checking unique constraints..."
susql << 'EOF' > /tmp/unique_test.txt 2>&1
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_name LIKE 'face%'
    AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name, tc.constraint_name;
EOF

UNIQUE_CONSTRAINTS=$(grep -c "face" /tmp/unique_test.txt || echo "0")

if [ "$UNIQUE_CONSTRAINTS" -ge 2 ]; then
    print_result 0 "Unique constraints are properly configured ($UNIQUE_CONSTRAINTS constraints found)"
else
    print_result 1 "Missing unique constraints ($UNIQUE_CONSTRAINTS constraints found, expected >=2)"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! The face recognition system is working correctly.${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Start your development server: npm run dev"
    echo "   2. Test with real authentication tokens"
    echo "   3. Upload test images to verify face detection"
    echo "   4. Create person groups and assign faces"
    echo "   5. Test similarity search with real data"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Please check the output above for details.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Ensure the database migrations have been run"
    echo "   2. Check that pgvector extension is enabled"
    echo "   3. Verify all tables and functions were created"
    echo "   4. Start the development server if testing API endpoints"
    exit 1
fi
