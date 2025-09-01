#!/bin/bash

# Database Migration Verification Script
# This script verifies that the face recognition migration was successful

echo "🔍 Verifying Face Recognition Database Migration"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
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

echo ""
echo "🔍 Phase 1: Database Tables Verification"
echo "----------------------------------------"

# Test 1: Check if pgvector extension is enabled
print_info "Checking pgvector extension..."
PGVECTOR_RESULT=$(susql -t -c "SELECT extname FROM pg_extension WHERE extname = 'vector';" 2>/dev/null | grep -c "vector" || echo "0")
if [ "$PGVECTOR_RESULT" -eq 1 ]; then
    print_result 0 "pgvector extension is enabled"
else
    print_result 1 "pgvector extension is not enabled"
fi

# Test 2: Check if face recognition tables exist
print_info "Checking face recognition tables..."
FACE_TABLES=$(susql -t -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('face_collections', 'faces', 'person_groups', 'face_person_links', 'face_similarities', 'face_processing_queue') ORDER BY table_name;" 2>/dev/null | grep -c "face\|person_groups" || echo "0")
if [ "$FACE_TABLES" -eq 6 ]; then
    print_result 0 "All face recognition tables exist ($FACE_TABLES tables)"
else
    print_result 1 "Missing face recognition tables ($FACE_TABLES found, expected 6)"
fi

# Test 3: Check if face recognition functions exist
print_info "Checking face recognition functions..."
FACE_FUNCTIONS=$(susql -t -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND (routine_name LIKE 'find_%' OR routine_name LIKE 'get_%' OR routine_name LIKE 'suggest_%') ORDER BY routine_name;" 2>/dev/null | grep -c "find_\|get_\|suggest_" || echo "0")
if [ "$FACE_FUNCTIONS" -eq 6 ]; then
    print_result 0 "All face recognition functions exist ($FACE_FUNCTIONS functions)"
else
    print_result 1 "Missing face recognition functions ($FACE_FUNCTIONS found, expected 6)"
fi

# Test 4: Check if vector index exists
print_info "Checking vector similarity index..."
VECTOR_INDEX=$(susql -t -c "SELECT indexname FROM pg_indexes WHERE tablename = 'faces' AND indexname = 'idx_faces_face_vector';" 2>/dev/null | grep -c "idx_faces_face_vector" || echo "0")
if [ "$VECTOR_INDEX" -eq 1 ]; then
    print_result 0 "Vector similarity index exists"
else
    print_result 1 "Vector similarity index is missing"
fi

echo ""
echo "🔍 Phase 2: Database Function Testing"
echo "-------------------------------------"

# Test 5: Test find_similar_faces function
print_info "Testing find_similar_faces function..."
if susql -c "SELECT * FROM find_similar_faces('00000000-0000-0000-0000-000000000000', 0.8, 5);" >/dev/null 2>&1; then
    print_result 0 "find_similar_faces function executes successfully"
else
    print_result 1 "find_similar_faces function failed to execute"
fi

# Test 6: Test get_face_detection_stats function
print_info "Testing get_face_detection_stats function..."
if susql -c "SELECT * FROM get_face_detection_stats('00000000-0000-0000-0000-000000000000');" >/dev/null 2>&1; then
    print_result 0 "get_face_detection_stats function executes successfully"
else
    print_result 1 "get_face_detection_stats function failed to execute"
fi

# Test 7: Test find_unassigned_faces function
print_info "Testing find_unassigned_faces function..."
if susql -c "SELECT * FROM find_unassigned_faces('00000000-0000-0000-0000-000000000000', 5);" >/dev/null 2>&1; then
    print_result 0 "find_unassigned_faces function executes successfully"
else
    print_result 1 "find_unassigned_faces function failed to execute"
fi

echo ""
echo "🔍 Phase 3: Table Structure Verification"
echo "----------------------------------------"

# Test 8: Check if faces table has vector column
print_info "Checking faces table structure..."
VECTOR_COLUMN=$(susql -t -c "\d faces" 2>/dev/null | grep -c "face_vector.*vector(128)" || echo "0")
if [ "$VECTOR_COLUMN" -eq 1 ]; then
    print_result 0 "faces table has vector(128) column"
else
    print_result 1 "faces table missing vector(128) column"
fi

# Test 9: Check if RLS policies exist
print_info "Checking RLS policies..."
RLS_POLICIES=$(susql -t -c "SELECT policyname FROM pg_policies WHERE tablename LIKE 'face%' OR tablename = 'person_groups';" 2>/dev/null | grep -c "face\|person_groups" || echo "0")
if [ "$RLS_POLICIES" -ge 6 ]; then
    print_result 0 "RLS policies are configured ($RLS_POLICIES policies)"
else
    print_result 1 "Missing RLS policies ($RLS_POLICIES found, expected >=6)"
fi

# Test 10: Check if triggers exist
print_info "Checking triggers..."
TRIGGERS=$(susql -t -c "SELECT trigger_name FROM information_schema.triggers WHERE trigger_name LIKE '%face%' OR trigger_name LIKE '%person_groups%';" 2>/dev/null | grep -c "face\|person_groups" || echo "0")
if [ "$TRIGGERS" -ge 5 ]; then
    print_result 0 "Triggers are configured ($TRIGGERS triggers)"
else
    print_result 1 "Missing triggers ($TRIGGERS found, expected >=5)"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All database tests passed! The face recognition migration was successful.${NC}"
    echo ""
    echo "📋 Database Status:"
    echo "   ✅ pgvector extension enabled"
    echo "   ✅ All 6 face recognition tables created"
    echo "   ✅ All 6 face recognition functions created"
    echo "   ✅ Vector similarity index created"
    echo "   ✅ RLS policies configured"
    echo "   ✅ Triggers configured"
    echo ""
    echo "🚀 Ready for testing with real data!"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some database tests failed. Please check the output above for details.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check if the migration script ran completely"
    echo "   2. Verify database permissions"
    echo "   3. Check for any error messages in the migration"
    exit 1
fi
