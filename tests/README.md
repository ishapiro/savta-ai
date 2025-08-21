# Tests Directory

This directory contains various test files and scripts for the Savta AI application.

**Note**: All test files should be created in this directory. Test files in the root directory will be moved here to maintain proper organization.

## Test Files

### SQL Test Files

#### `test_sendgrid_events.sql`
- **Purpose**: Queries to verify SendGrid webhook events are being written to the database
- **Usage**: Run with `susql` alias to check email event tracking
- **Contains**: Multiple queries for checking email events, user associations, and event statistics

#### `test_webhook.sql`
- **Purpose**: Test script to manually insert sample events and verify table structure
- **Usage**: Tests the `email_events` table structure and data insertion
- **Contains**: Sample event insertion and verification queries

#### `test_memory_books_query.sql`
- **Purpose**: Database queries for testing memory book functionality
- **Usage**: Verify memory book data and relationships
- **Contains**: Queries for memory book tables and relationships

#### `test_activity_tab.sql`
- **Purpose**: Test script to add sample activity data for testing the Activity tab
- **Usage**: Populate activity_log and email_events tables with test data
- **Contains**: Sample activity log entries and email events for testing the admin Activity tab

#### `test_analytics_phase1.sql`
- **Purpose**: Test Phase 1 analytics implementation
- **Usage**: Run after implementing Phase 1 to verify database schema, indexes, and analytics tracking functionality
- **Contains**: Database schema verification, test data insertion, and analytics query validation

#### `test_analytics_phase2.sql`
- **Purpose**: Test Phase 2 analytics implementation with geolocation and enhanced engagement metrics
- **Usage**: Run after implementing Phase 2 to verify geolocation tracking, UTM parameters, and engagement analytics
- **Contains**: Geolocation data verification, UTM parameter tracking, engagement metrics analysis, and performance testing

#### `test_analytics_debug.sql`
- **Purpose**: Debug analytics implementation and troubleshoot tracking issues
- **Usage**: Run to verify analytics data is being written correctly and identify any issues
- **Contains**: Schema verification, recent event analysis, session tracking checks, and data quality validation

### JavaScript Test Files

#### Recently Moved Test Files (PDF Viewer, Story Generation, Cropping, etc.)
- **`test_pdf_viewer_panning.js`**: Test PDF viewer panning functionality
- **`test_dynamic_sizing.js`**: Test dynamic image sizing in PDF viewer
- **`test_panning_fix.js`**: Test panning fix implementation
- **`test_grid_layout_indicator.js`**: Test grid layout page indicator
- **`test_page_calculation_fix.js`**: Test page calculation fixes
- **`test_memory_book_pdf_only.js`**: Test memory book PDF-only output
- **`test_story_text_rendering.js`**: Test story text rendering improvements
- **`test_dynamic_font_sizing.js`**: Test dynamic font sizing for stories
- **`test_height_utilization.js`**: Test full height utilization for stories
- **`test_story_generator_requirements.js`**: Test story generator requirements
- **`test_location_aware_story.js`**: Test location-aware story generation
- **`test_story_generation_fix.js`**: Test story generation fixes
- **`test_complete_cropping_integration.js`**: Test complete cropping integration
- **`test_enhanced_face_preservation.js`**: Test enhanced face preservation
- **`test_rekognition_integration.js`**: Test AWS Rekognition integration
- **`test_theme_photo_count.js`**: Test theme photo count functionality
- **`test_background_generation.js`**: Test background generation
- **`test_ai_description.js`**: Test AI description functionality
- **`test_delete_fix.js`**: Test delete functionality fixes

#### Legacy Test Files
#### `test_theme_integration.js`
- **Purpose**: Test PrimeVue theme integration and Tailwind CSS compatibility
- **Usage**: Verify theme system is working correctly
- **Contains**: Theme testing and validation logic

#### `test_theme_retrieval.js`
- **Purpose**: Test theme retrieval and application
- **Usage**: Verify theme loading and application
- **Contains**: Theme retrieval testing logic

#### `test_memory_books_api.js`
- **Purpose**: Test memory book API endpoints
- **Usage**: Verify memory book generation and management APIs
- **Contains**: API endpoint testing for memory books

#### `test_jpg_conversion.js`
- **Purpose**: Test PDF to JPG conversion functionality
- **Usage**: Verify poppler-utils integration for PDF processing
- **Contains**: PDF conversion testing logic

#### `test-pdf-to-jpg.js`
- **Purpose**: Test PDF to JPG conversion endpoint
- **Usage**: Verify the `/api/pdf-to-jpg` endpoint functionality
- **Contains**: Endpoint testing for PDF conversion

## Running Tests

### SQL Tests
```bash
# Run a specific SQL test
cat tests/test_sendgrid_events.sql | susql

# Run webhook test
cat tests/test_webhook.sql | susql

# Run memory books query test
cat tests/test_memory_books_query.sql | susql
```

### JavaScript Tests
```bash
# Run theme integration test
node tests/test_theme_integration.js

# Run memory books API test
node tests/test_memory_books_api.js

# Run PDF conversion test
node tests/test-pdf-to-jpg.js
```

## Test Categories

### Database Tests
- Email event tracking verification
- Memory book data integrity
- Webhook functionality validation

### API Tests
- Memory book generation endpoints
- PDF conversion functionality
- Theme system integration

### Integration Tests
- PrimeVue theme compatibility
- Tailwind CSS integration
- PDF processing pipeline

## Notes

- **SQL tests** require the `susql` alias to be configured
- **JavaScript tests** may require specific environment variables
- **API tests** require the development server to be running
- **Integration tests** verify cross-component functionality

## Organization Policy

### Test File Location
- **All test files must be created in the `tests/` directory**
- **Test files in the root directory will be moved here**
- **This ensures proper organization and prevents clutter**

### Naming Convention
- **JavaScript tests**: `test_*.js`
- **SQL tests**: `test_*.sql`
- **Use descriptive names that indicate the feature being tested**

### Running Tests
```bash
# From the project root, run tests in the tests directory
node tests/test_filename.js

# For SQL tests
cat tests/test_filename.sql | susql
```

## Maintenance

- Update test files when adding new features
- Ensure tests reflect current database schema
- Verify API endpoints match test expectations
- Keep test data current with application changes
- **Always create new tests in the tests/ directory**
