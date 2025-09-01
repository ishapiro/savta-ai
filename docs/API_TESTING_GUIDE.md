# Face Recognition API Testing Guide

## 🧪 Overview

This guide provides comprehensive testing for the face recognition API endpoints. The testing covers authentication, validation, error handling, and functionality verification.

## 📋 Test Scripts Available

### 1. Basic API Testing (No Authentication)
**Script**: `scripts/test-face-recognition-api.sh`
**Purpose**: Tests endpoint availability, authentication enforcement, and basic validation
**Requirements**: Development server running on localhost:3000

### 2. Advanced API Testing (With Authentication)
**Script**: `scripts/test-face-recognition-api-with-auth.sh`
**Purpose**: Tests full functionality with authentication tokens
**Requirements**: Development server + valid AUTH_TOKEN

## 🚀 Quick Start

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Run Basic Tests
```bash
./scripts/test-face-recognition-api.sh
```

### Step 3: Run Authenticated Tests (Optional)
```bash
export AUTH_TOKEN='your-jwt-token-here'
./scripts/test-face-recognition-api-with-auth.sh
```

## 📊 Test Coverage

### Phase 1: Authentication Tests
- ✅ **Unauthenticated Access**: All endpoints return 401 without auth
- ✅ **Authentication Enforcement**: Proper auth middleware implementation
- ✅ **Token Validation**: Valid tokens allow access

### Phase 2: Endpoint Availability Tests
- ✅ **GET /api/ai/face-collection-status**: Collection overview
- ✅ **POST /api/ai/person-groups**: Person management
- ✅ **POST /api/ai/find-similar-faces**: Similarity search
- ✅ **POST /api/ai/assign-face-to-person**: Face assignment
- ✅ **POST /api/ai/detect-faces-rekognition**: Face detection

### Phase 3: Request Validation Tests
- ✅ **Invalid Actions**: Proper error handling for invalid actions
- ✅ **Missing Data**: Validation for required fields
- ✅ **Invalid UUIDs**: Proper UUID format validation
- ✅ **Invalid URLs**: Image URL validation

### Phase 4: Method Validation Tests
- ✅ **Wrong HTTP Methods**: Proper 405 responses for incorrect methods
- ✅ **Method Enforcement**: Each endpoint only accepts correct methods

### Phase 5: Content-Type Validation Tests
- ✅ **Missing Content-Type**: Proper handling of missing headers
- ✅ **Invalid Content-Type**: Validation of content type headers

### Phase 6: JSON Validation Tests
- ✅ **Invalid JSON**: Proper error handling for malformed JSON
- ✅ **JSON Parsing**: Robust JSON parsing implementation

### Phase 7: Data Validation Tests (Authenticated)
- ✅ **Empty Data**: Validation for empty request bodies
- ✅ **Duplicate Names**: Conflict handling for duplicate person names
- ✅ **Invalid Parameters**: Parameter validation and bounds checking

### Phase 8: Edge Case Tests (Authenticated)
- ✅ **Long Names**: Validation for extremely long input
- ✅ **Special Characters**: XSS and injection prevention
- ✅ **Extreme Parameters**: Boundary value testing

### Phase 9: Person Group Management Tests (Authenticated)
- ✅ **CRUD Operations**: Create, read, update, delete operations
- ✅ **Non-existent Resources**: Proper 404 handling
- ✅ **Data Integrity**: Consistent data management

### Phase 10: Face Assignment Tests (Authenticated)
- ✅ **Assignment Logic**: Face-to-person assignment functionality
- ✅ **Confidence Validation**: Confidence score validation
- ✅ **Assignment Tracking**: Audit trail for assignments

## 🔧 API Endpoints Tested

### 1. Face Collection Status
```http
GET /api/ai/face-collection-status
```
**Tests**:
- Authentication required (401 without token)
- Returns collection statistics
- Proper error handling

### 2. Person Groups Management
```http
POST /api/ai/person-groups
```
**Actions Tested**:
- `create`: Create new person group
- `list`: List all person groups
- `get`: Get specific person group
- `update`: Update person group
- `delete`: Delete person group

**Tests**:
- Authentication required
- Data validation
- Duplicate name handling
- CRUD operations

### 3. Find Similar Faces
```http
POST /api/ai/find-similar-faces
```
**Tests**:
- Authentication required
- Face ID validation
- Parameter validation (limit, similarity threshold)
- Vector similarity search functionality

### 4. Assign Face to Person
```http
POST /api/ai/assign-face-to-person
```
**Tests**:
- Authentication required
- Face and person ID validation
- Confidence score validation
- Assignment tracking

### 5. Detect Faces (Enhanced)
```http
POST /api/ai/detect-faces-rekognition
```
**Tests**:
- Authentication required
- Image URL validation
- AWS Rekognition integration
- Face vector storage

## 📝 Expected Test Results

### Basic Tests (Without Authentication)
- **25 tests total**
- **Expected**: All tests should pass
- **Success Criteria**: All endpoints return 401 (authentication required)

### Authenticated Tests (With Valid Token)
- **18 tests total**
- **Expected**: Most tests should pass
- **Success Criteria**: 
  - Valid operations return 200/201
  - Invalid operations return 400/404/409
  - Proper error messages

## 🔍 How to Get Authentication Token

### Method 1: Browser Developer Tools
1. Open the application in browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Make any authenticated request
5. Look for `Authorization: Bearer <token>` header

### Method 2: Local Storage
1. Open browser console
2. Run: `localStorage.getItem('auth-token')` or similar
3. Copy the token value

### Method 3: Application Login
1. Log into the application
2. Check for token in application state
3. Copy the JWT token

## 🚨 Troubleshooting

### Common Issues

#### 1. Server Not Running
```bash
# Error: Server is not running on localhost:3000
# Solution: Start the development server
npm run dev
```

#### 2. Authentication Token Issues
```bash
# Error: No AUTH_TOKEN environment variable set
# Solution: Set the token
export AUTH_TOKEN='your-jwt-token-here'
```

#### 3. Endpoint Not Found (404)
```bash
# Error: Endpoint returns 404 instead of 401
# Solution: Check if API routes are properly implemented
# Verify the endpoint exists in server/api/ai/
```

#### 4. Database Connection Issues
```bash
# Error: Database-related errors in API responses
# Solution: Ensure database is running and migrated
./scripts/verify-database-migration.sh
```

### Debug Mode

To see detailed responses, modify the test scripts to show response bodies:

```bash
# In the test scripts, change:
echo "   Response: $response_body"

# To always show responses:
echo "   Response: $response_body"
```

## 📊 Test Results Interpretation

### All Tests Pass (✅)
- API endpoints are properly implemented
- Authentication is working correctly
- Validation is functioning as expected
- Ready for production testing

### Some Tests Fail (⚠️)
- Check the specific failing tests
- Verify endpoint implementation
- Check authentication middleware
- Review error handling logic

### Most Tests Fail (❌)
- Check if development server is running
- Verify API routes are implemented
- Check database connection
- Review authentication setup

## 🎯 Next Steps After Testing

### 1. Manual Testing
- Test with real images
- Verify face detection accuracy
- Test person group management UI
- Validate similarity search results

### 2. Integration Testing
- Test with frontend components
- Verify end-to-end workflows
- Test error handling in UI
- Validate data persistence

### 3. Performance Testing
- Test with large datasets
- Verify response times
- Test concurrent requests
- Monitor resource usage

### 4. Production Deployment
- Deploy to staging environment
- Run full test suite
- Monitor for errors
- Deploy to production

## 📚 Additional Resources

- [Database Migration Guide](DATABASE_MIGRATION_VERIFICATION.md)
- [Face Recognition Implementation](FACE_RECOGNITION_PHASE2_IMPLEMENTATION.md)
- [API Documentation](API_ENDPOINTS.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

---

**Ready to test your face recognition API!** 🚀
