#!/bin/bash

# Simple Face Recognition System Test Script
# This script tests the key components without requiring database connection

echo "🧪 Simple Face Recognition System Test"
echo "======================================"

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

echo ""
echo "🔍 Phase 1: File Structure Verification"
echo "---------------------------------------"

# Test 1: Check if schema.sql exists and contains face recognition tables
print_info "Checking schema.sql file..."
if [ -f "supabase/schema.sql" ]; then
    print_result 0 "schema.sql file exists"
    
    # Check for face recognition tables
    FACE_TABLES=$(grep -c "create table.*face\|create table.*person_groups" supabase/schema.sql || echo "0")
    if [ "$FACE_TABLES" -ge 6 ]; then
        print_result 0 "Face recognition tables found in schema.sql ($FACE_TABLES tables)"
    else
        print_result 1 "Missing face recognition tables in schema.sql ($FACE_TABLES found, expected >=6)"
    fi
else
    print_result 1 "schema.sql file not found"
fi

# Test 2: Check if face recognition functions exist in schema.sql
print_info "Checking face recognition functions in schema.sql..."
FACE_FUNCTIONS=$(grep -c "CREATE OR REPLACE FUNCTION.*find_\|CREATE OR REPLACE FUNCTION.*get_\|CREATE OR REPLACE FUNCTION.*suggest_\|create or replace function.*find_\|create or replace function.*get_\|create or replace function.*suggest_" supabase/schema.sql || echo "0")
if [ "$FACE_FUNCTIONS" -ge 6 ]; then
    print_result 0 "Face recognition functions found in schema.sql ($FACE_FUNCTIONS functions)"
else
    print_result 1 "Missing face recognition functions in schema.sql ($FACE_FUNCTIONS found, expected >=6)"
fi

# Test 3: Check if pgvector extension is enabled in schema.sql
print_info "Checking pgvector extension in schema.sql..."
if grep -q "create extension.*vector" supabase/schema.sql; then
    print_result 0 "pgvector extension is enabled in schema.sql"
else
    print_result 1 "pgvector extension is not enabled in schema.sql"
fi

echo ""
echo "🔍 Phase 2: API Endpoint Files Verification"
echo "-------------------------------------------"

# Test 4: Check if API endpoint files exist
print_info "Checking API endpoint files..."

ENDPOINTS=(
    "server/api/ai/detect-faces-rekognition.post.js"
    "server/api/ai/face-collection-status.get.js"
    "server/api/ai/person-groups.post.js"
    "server/api/ai/find-similar-faces.post.js"
    "server/api/ai/assign-face-to-person.post.js"
)

for endpoint in "${ENDPOINTS[@]}"; do
    if [ -f "$endpoint" ]; then
        print_result 0 "API endpoint exists: $endpoint"
    else
        print_result 1 "API endpoint missing: $endpoint"
    fi
done

echo ""
echo "🔍 Phase 3: Migration Scripts Verification"
echo "------------------------------------------"

# Test 5: Check if migration scripts exist
print_info "Checking migration scripts..."

MIGRATION_SCRIPTS=(
    "supabase/add_face_recognition_tables.sql"
    "supabase/face_similarity_functions.sql"
    "scripts/run-face-recognition-migration.sh"
    "scripts/run-face-functions-migration.sh"
)

for script in "${MIGRATION_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        print_result 0 "Migration script exists: $script"
    else
        print_result 1 "Migration script missing: $script"
    fi
done

echo ""
echo "🔍 Phase 4: Documentation Verification"
echo "-------------------------------------"

# Test 6: Check if documentation files exist
print_info "Checking documentation files..."

DOCS=(
    "docs/FACE_RECOGNITION_PHASE1_IMPLEMENTATION.md"
    "docs/FACE_RECOGNITION_PHASE2_IMPLEMENTATION.md"
    "docs/SCHEMA_UPDATE_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_result 0 "Documentation exists: $doc"
    else
        print_result 1 "Documentation missing: $doc"
    fi
done

echo ""
echo "🔍 Phase 5: Code Quality Verification"
echo "------------------------------------"

# Test 7: Check if enhanced face detection API has required imports
print_info "Checking enhanced face detection API..."
if grep -q "IndexFacesCommand\|CreateCollectionCommand" server/api/ai/detect-faces-rekognition.post.js; then
    print_result 0 "Enhanced face detection API has required AWS imports"
else
    print_result 1 "Enhanced face detection API missing required AWS imports"
fi

# Test 8: Check if face detection API has Supabase integration
if grep -q "serverSupabaseClient" server/api/ai/detect-faces-rekognition.post.js; then
    print_result 0 "Enhanced face detection API has Supabase integration"
else
    print_result 1 "Enhanced face detection API missing Supabase integration"
fi

# Test 9: Check if person groups API has proper validation
if grep -q "action.*personGroup" server/api/ai/person-groups.post.js; then
    print_result 0 "Person groups API has proper request validation"
else
    print_result 1 "Person groups API missing proper request validation"
fi

# Test 10: Check if similarity search API has fallback logic
if grep -q "manualSimilaritySearch" server/api/ai/find-similar-faces.post.js; then
    print_result 0 "Similarity search API has fallback logic"
else
    print_result 1 "Similarity search API missing fallback logic"
fi

echo ""
echo "🔍 Phase 6: Database Schema Content Verification"
echo "------------------------------------------------"

# Test 11: Check for vector data type in schema
print_info "Checking vector data type in schema..."
if grep -q "vector(128)" supabase/schema.sql; then
    print_result 0 "Vector data type is properly defined in schema"
else
    print_result 1 "Vector data type is missing from schema"
fi

# Test 12: Check for RLS policies in schema
print_info "Checking RLS policies in schema..."
RLS_POLICIES=$(grep -c "CREATE POLICY.*face\|create policy.*face\|CREATE POLICY.*face_\|CREATE POLICY.*person_groups" supabase/schema.sql || echo "0")
if [ "$RLS_POLICIES" -ge 6 ]; then
    print_result 0 "RLS policies are properly configured ($RLS_POLICIES policies)"
else
    print_result 1 "Missing RLS policies ($RLS_POLICIES found, expected >=6)"
fi

# Test 13: Check for indexes in schema
print_info "Checking indexes in schema..."
INDEXES=$(grep -c "CREATE INDEX.*face\|create index.*face" supabase/schema.sql || echo "0")
if [ "$INDEXES" -ge 8 ]; then
    print_result 0 "Database indexes are properly configured ($INDEXES indexes)"
else
    print_result 1 "Missing database indexes ($INDEXES found, expected >=8)"
fi

# Test 14: Check for triggers in schema
print_info "Checking triggers in schema..."
TRIGGERS=$(grep -c "CREATE TRIGGER.*face\|create trigger.*face\|CREATE TRIGGER.*face_\|CREATE TRIGGER.*person_groups" supabase/schema.sql || echo "0")
if [ "$TRIGGERS" -ge 5 ]; then
    print_result 0 "Database triggers are properly configured ($TRIGGERS triggers)"
else
    print_result 1 "Missing database triggers ($TRIGGERS found, expected >=5)"
fi

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! The face recognition system files are properly structured.${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Set up your database connection: export DATABASE_URL='your-connection-string'"
    echo "   2. Run the database migrations: ./scripts/run-face-recognition-migration.sh"
    echo "   3. Start your development server: npm run dev"
    echo "   4. Test with real authentication tokens"
    echo "   5. Upload test images to verify face detection"
    echo ""
    echo "🔧 Database Setup:"
    echo "   If you need to set up the susql alias:"
    echo "   alias susql='psql \$DATABASE_URL'"
    echo ""
    echo "   Then run the full test:"
    echo "   ./scripts/test-face-recognition-system.sh"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Please check the output above for details.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Ensure all files were created properly"
    echo "   2. Check that schema.sql was updated correctly"
    echo "   3. Verify API endpoint files exist"
    echo "   4. Make sure documentation files are present"
    exit 1
fi
