#!/bin/bash

# Face Recognition API Test Script with Authentication
# This script tests all face recognition API endpoints with authentication

echo "🧪 Testing Face Recognition API Endpoints with Authentication"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Configuration
BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api/ai"

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

# Function to test API endpoint with auth
test_endpoint_with_auth() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local test_name=$5
    local auth_token=$6
    
    print_info "Testing $test_name..."
    
    if [ -z "$auth_token" ]; then
        print_warning "No authentication token provided, skipping authenticated test"
        return
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$endpoint" \
            -H "Authorization: Bearer $auth_token" 2>/dev/null)
    else
        response=$(curl -s -w "%{http_code}" -X "$method" "$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $auth_token" \
            -d "$data" 2>/dev/null)
    fi
    
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$http_code" = "$expected_status" ]; then
        print_result 0 "$test_name (HTTP $http_code)"
        if [ "$http_code" = "200" ]; then
            echo "   Response: $response_body"
        fi
    else
        print_result 1 "$test_name (Expected: $expected_status, Got: $http_code)"
        echo "   Response: $response_body"
    fi
}

# Check if server is running
print_info "Checking if server is running..."
if curl -s "$BASE_URL" > /dev/null 2>&1; then
    print_result 0 "Server is running on $BASE_URL"
else
    print_warning "Server is not running on $BASE_URL"
    print_info "Please start the development server with: npm run dev"
    exit 1
fi

# Check for authentication token
print_info "Checking for authentication token..."
if [ -z "$AUTH_TOKEN" ]; then
    print_warning "No AUTH_TOKEN environment variable set"
    echo ""
    echo "📝 To test with authentication, set the AUTH_TOKEN environment variable:"
    echo "   export AUTH_TOKEN='your-jwt-token-here'"
    echo ""
    echo "📋 You can get a token by:"
    echo "   1. Logging into the application"
    echo "   2. Opening browser dev tools"
    echo "   3. Looking for the Authorization header in network requests"
    echo "   4. Or checking localStorage for the token"
    echo ""
    echo "🔧 Running basic endpoint tests without authentication..."
    echo ""
    
    # Run basic tests without auth
    ./scripts/test-face-recognition-api.sh
    exit $?
fi

print_result 0 "Authentication token found"

echo ""
echo "🔍 Phase 1: Authenticated Endpoint Tests"
echo "---------------------------------------"

# Test 1: Face collection status with auth
test_endpoint_with_auth "GET" "$API_BASE/face-collection-status" "" "200" "Face collection status with authentication" "$AUTH_TOKEN"

# Test 2: Create person group with auth
test_endpoint_with_auth "POST" "$API_BASE/person-groups" '{"action": "create", "personGroup": {"name": "Test Person", "displayName": "Test Person", "relationship": "Friend"}}' "200" "Create person group with authentication" "$AUTH_TOKEN"

# Test 3: Get person groups with auth
test_endpoint_with_auth "POST" "$API_BASE/person-groups" '{"action": "list"}' "200" "List person groups with authentication" "$AUTH_TOKEN"

# Test 4: Find similar faces with auth (should work even with no data)
test_endpoint_with_auth "POST" "$API_BASE/find-similar-faces" '{"faceId": "00000000-0000-0000-0000-000000000000", "limit": 5, "similarityThreshold": 0.8}' "200" "Find similar faces with authentication" "$AUTH_TOKEN"

# Test 5: Get face detection stats with auth
test_endpoint_with_auth "GET" "$API_BASE/face-collection-status" "" "200" "Get face detection statistics with authentication" "$AUTH_TOKEN"

echo ""
echo "🔍 Phase 2: Data Validation Tests"
echo "--------------------------------"

# Test 6: Create person group with invalid data
test_endpoint_with_auth "POST" "$API_BASE/person-groups" '{"action": "create", "personGroup": {}}' "400" "Create person group with empty data" "$AUTH_TOKEN"

# Test 7: Create person group with duplicate name
test_endpoint_with_auth "POST" "$API_BASE/person-groups" '{"action": "create", "personGroup": {"name": "Test Person", "displayName": "Test Person"}}' "409" "Create person group with duplicate name" "$AUTH_TOKEN"

# Test 8: Find similar faces with invalid parameters
test_endpoint_with_auth "POST" "$API_BASE/find-similar-faces" '{"faceId": "invalid-uuid"}' "400" "Find similar faces with invalid faceId" "$AUTH_TOKEN"

# Test 9: Assign face to person with invalid data
test_endpoint_with_auth "POST" "$API_BASE/assign-face-to-person" '{"faceId": "invalid-uuid", "personGroupId": "invalid-uuid"}' "400" "Assign face to person with invalid UUIDs" "$AUTH_TOKEN"

echo ""
echo "🔍 Phase 3: Edge Case Tests"
echo "---------------------------"

# Test 10: Person groups with very long name
test_endpoint_with_auth "POST" "$API_BASE/person-groups" '{"action": "create", "personGroup": {"name": "'$(printf 'A%.0s' {1..100})'", "displayName": "Very Long Name"}}' "400" "Create person group with very long name" "$AUTH_TOKEN"

# Test 11: Person groups with special characters
test_endpoint_with_auth "POST" "$API_BASE/person-groups" '{"action": "create", "personGroup": {"name": "Test Person <script>alert(\"xss\")</script>", "displayName": "XSS Test"}}' "400" "Create person group with special characters" "$AUTH_TOKEN"

# Test 12: Find similar faces with extreme parameters
test_endpoint_with_auth "POST" "$API_BASE/find-similar-faces" '{"faceId": "00000000-0000-0000-0000-000000000000", "limit": 1000, "similarityThreshold": 2.0}' "400" "Find similar faces with extreme parameters" "$AUTH_TOKEN"

echo ""
echo "🔍 Phase 4: Person Group Management Tests"
echo "----------------------------------------"

# Test 13: Update person group
test_endpoint_with_auth "POST" "$API_BASE/person-groups" '{"action": "update", "personGroupId": "00000000-0000-0000-0000-000000000000", "personGroup": {"displayName": "Updated Test Person"}}' "404" "Update non-existent person group" "$AUTH_TOKEN"

# Test 14: Delete person group
test_endpoint_with_auth "POST" "$API_BASE/person-groups" '{"action": "delete", "personGroupId": "00000000-0000-0000-0000-000000000000"}' "404" "Delete non-existent person group" "$AUTH_TOKEN"

# Test 15: Get person group details
test_endpoint_with_auth "POST" "$API_BASE/person-groups" '{"action": "get", "personGroupId": "00000000-0000-0000-0000-000000000000"}' "404" "Get non-existent person group details" "$AUTH_TOKEN"

echo ""
echo "🔍 Phase 5: Face Assignment Tests"
echo "--------------------------------"

# Test 16: Assign face to person with non-existent data
test_endpoint_with_auth "POST" "$API_BASE/assign-face-to-person" '{"faceId": "00000000-0000-0000-0000-000000000000", "personGroupId": "00000000-0000-0000-0000-000000000000", "confidence": 0.95, "assignedBy": "user"}' "404" "Assign non-existent face to non-existent person" "$AUTH_TOKEN"

# Test 17: Assign face to person with invalid confidence
test_endpoint_with_auth "POST" "$API_BASE/assign-face-to-person" '{"faceId": "00000000-0000-0000-0000-000000000000", "personGroupId": "00000000-0000-0000-0000-000000000000", "confidence": 1.5, "assignedBy": "user"}' "400" "Assign face with invalid confidence" "$AUTH_TOKEN"

# Test 18: Assign face to person with invalid assignedBy
test_endpoint_with_auth "POST" "$API_BASE/assign-face-to-person" '{"faceId": "00000000-0000-0000-0000-000000000000", "personGroupId": "00000000-0000-0000-0000-000000000000", "confidence": 0.95, "assignedBy": "invalid"}' "400" "Assign face with invalid assignedBy" "$AUTH_TOKEN"

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All authenticated API tests passed! The face recognition API is working correctly.${NC}"
    echo ""
    echo "📋 API Status:"
    echo "   ✅ Authentication is working"
    echo "   ✅ All endpoints respond correctly"
    echo "   ✅ Data validation is working"
    echo "   ✅ Error handling is working"
    echo "   ✅ Edge cases are handled properly"
    echo ""
    echo "🚀 Ready for production testing!"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Test with real image uploads"
    echo "   2. Test face detection with actual photos"
    echo "   3. Test similarity search with real faces"
    echo "   4. Test person group management with real data"
    echo "   5. Deploy to production environment"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some authenticated API tests failed. Please check the output above for details.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check if the authentication token is valid"
    echo "   2. Verify the user has proper permissions"
    echo "   3. Check server logs for detailed error messages"
    echo "   4. Ensure all API endpoints are properly implemented"
    exit 1
fi
