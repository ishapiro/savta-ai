# Tests Directory

This directory contains various test files and scripts for the Savta AI application.

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

### JavaScript Test Files

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

## Maintenance

- Update test files when adding new features
- Ensure tests reflect current database schema
- Verify API endpoints match test expectations
- Keep test data current with application changes
