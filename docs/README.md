# Documentation

This directory contains detailed documentation for various aspects of the Savta AI application.

## Documentation Files

### Setup & Configuration

#### `ENVIRONMENT_SETUP.md`
- **Purpose**: Step-by-step guide for setting up environment variables
- **Content**: Environment variable configuration, API key setup, and prerequisites
- **Audience**: New developers setting up the project

#### `PRIMEVUE_SETUP.md`
- **Purpose**: Detailed instructions for PrimeVue configuration
- **Content**: Manual PrimeVue integration, component registration, and troubleshooting
- **Audience**: Developers working with the UI framework

### Database & Schema

#### `DATABASE_FIX_INSTRUCTIONS.md`
- **Purpose**: Instructions for fixing database issues
- **Content**: Database migration fixes, schema updates, and troubleshooting
- **Audience**: Developers encountering database problems

#### `UPDATED_DATABASE_INSTRUCTIONS.md`
- **Purpose**: Updated database setup and migration instructions
- **Content**: Current database schema, migration procedures, and best practices
- **Audience**: Developers setting up or updating the database

### Feature Documentation

#### `MEMORY_BOOK_FEATURES.md`
- **Purpose**: Comprehensive guide to memory book functionality
- **Content**: AI-powered memory book generation, PDF creation, and user workflows
- **Audience**: Developers and users working with memory books

#### `MEMORY_BOOKS_PAGE_FLOW.md`
- **Purpose**: Detailed technical documentation of the memory-books page architecture
- **Content**: Complex component interactions, reactive state management, event flows, and API integration
- **Audience**: Developers working on the memory-books page implementation

#### `LOCATION_BASED_PHOTO_SELECTION.md`
- **Purpose**: Documentation of our sophisticated location-based photo selection system
- **Content**: 6-tier location hierarchy, ZipCodeAPI.com integration, intelligent caching, and fallback strategies
- **Audience**: Developers and stakeholders interested in our competitive advantage features

#### `LOCATION_FEATURE_UPDATE.md`
- **Purpose**: Documentation of location feature updates
- **Content**: Photo location detection, geocoding, and location-based features
- **Audience**: Developers working with location features

#### `PHOTO_ORIENTATION_UPDATE.md`
- **Purpose**: Documentation of photo orientation handling
- **Content**: EXIF data processing, image orientation, and display fixes
- **Audience**: Developers working with image processing

## Usage

### For New Developers
1. Start with `ENVIRONMENT_SETUP.md` for initial configuration
2. Review `PRIMEVUE_SETUP.md` for UI framework understanding
3. Check `UPDATED_DATABASE_INSTRUCTIONS.md` for database setup

### For Feature Development
- **Memory Books**: Refer to `MEMORY_BOOK_FEATURES.md` for feature overview
- **Memory Books Page Implementation**: See `MEMORY_BOOKS_PAGE_FLOW.md` for technical details
- **Location-Based Photo Selection**: Check `LOCATION_BASED_PHOTO_SELECTION.md` (our secret sauce!)
- **Location Features**: Check `LOCATION_FEATURE_UPDATE.md`
- **Image Processing**: Review `PHOTO_ORIENTATION_UPDATE.md`

### For Troubleshooting
- **Database Issues**: Use `DATABASE_FIX_INSTRUCTIONS.md`
- **UI Problems**: Check `PRIMEVUE_SETUP.md`
- **Environment Issues**: Review `ENVIRONMENT_SETUP.md`

## Maintenance

### Updating Documentation
- Keep documentation current with code changes
- Update feature docs when adding new functionality
- Maintain setup instructions for new team members
- Review and update troubleshooting guides regularly

### Documentation Standards
- Use clear, concise language
- Include code examples where helpful
- Provide step-by-step instructions for complex processes
- Keep audience in mind (developers vs. users)

## Related Resources

- **Main README**: `../README.md` - Project overview and quick start
- **Test Documentation**: `../tests/README.md` - Test files and procedures
- **Code Comments**: Inline documentation in source files
- **API Documentation**: Endpoint documentation in server files
