# Savta.ai Documentation

Complete documentation for the Savta.ai memory books and cards application.

## 📚 Primary Documentation

### **Core Documentation** (Start Here)

#### [`architecture.mermaid`](./architecture.mermaid)
- **System architecture diagram** showing complete application structure
- Client layer, server layer, database layer, and external services
- Data flow and authentication patterns
- **Read this first** before making any changes

#### [`technical.md`](./technical.md)
- **Complete technical specifications** for the entire project
- Technology stack, architecture, deployment configuration
- Supabase setup, Railway deployment, DNS configuration
- Environment variables, security, and performance
- **Comprehensive reference** for all technical aspects

## 🚀 Setup & Configuration

### Environment Setup

#### [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md)
- Required environment variables configuration
- API key setup (Supabase, OpenAI, AWS, SendGrid)
- Step-by-step setup instructions for new developers

#### [`PRIMEVUE_SETUP.md`](./PRIMEVUE_SETUP.md)
- PrimeVue 3 manual integration (NOT Nuxt module)
- Component registration and troubleshooting
- Why we use PrimeVue 3 instead of PrimeVue 4
- Adding new components to the plugin

#### [`MCP_SERVER_SETUP.md`](./MCP_SERVER_SETUP.md)
- Supabase MCP Server configuration for Cursor.ai
- Direct database access from AI
- Security considerations and read-only user setup
- Usage examples and troubleshooting

### Database Setup

#### [`BACKUP_STORAGE_SETUP.md`](./BACKUP_STORAGE_SETUP.md)
- Backup storage bucket configuration
- Admin-only access policies
- Backup system verification

> **Note**: For complete database schema and migration instructions, see [`technical.md`](./technical.md) sections on Supabase Configuration and Database Schema.

## 🎨 Feature Documentation

### Memory Books & Cards

#### [`MEMORY_BOOK_FEATURES.md`](./MEMORY_BOOK_FEATURES.md)
- Complete feature overview for memory books and cards
- AI-powered generation, PDF creation, user workflows
- Feature descriptions and capabilities

#### [`MEMORY_BOOKS_PAGE_FLOW.md`](./MEMORY_BOOKS_PAGE_FLOW.md)
- **Detailed technical documentation** of memory-books page architecture
- Component interactions, reactive state management, event flows
- API integration patterns and performance optimizations
- **Essential for developers** working on the memory-books page

#### [`MEMORY_STUDIO_REFACTOR_SUMMARY.md`](./MEMORY_STUDIO_REFACTOR_SUMMARY.md)
- Refactor summary from monolithic to modular architecture
- Composables structure and reusable components
- Test suite overview and technical improvements

### Photo Selection & AI

#### [`LOCATION_BASED_PHOTO_SELECTION.md`](./LOCATION_BASED_PHOTO_SELECTION.md)
- **Sophisticated 6-tier location hierarchy** system
- ZipCodeAPI integration for accurate distance calculations
- Intelligent caching and fallback strategies
- **Competitive advantage feature** documentation

#### [`LOCATION_FEATURE_UPDATE.md`](./LOCATION_FEATURE_UPDATE.md)
- Location feature updates and enhancements
- Photo location detection and geocoding
- Location-aware functionality

#### [`LOCATION_AWARE_STORY_GENERATION.md`](./LOCATION_AWARE_STORY_GENERATION.md)
- Story generation using location context
- Location-based narrative creation

#### [`AI_PHOTO_SELECTION_REASONING.md`](./AI_PHOTO_SELECTION_REASONING.md)
- AI-driven photo selection algorithms
- Selection reasoning and logic

#### [`ATTRIBUTE_BASED_PHOTO_SELECTION.md`](./ATTRIBUTE_BASED_PHOTO_SELECTION.md)
- Photo selection based on attributes
- Intelligent filtering and matching

#### [`ENHANCED_PHOTO_SELECTION.md`](./ENHANCED_PHOTO_SELECTION.md)
- Enhanced photo selection features
- Advanced selection capabilities

### Face Recognition

#### [`FACE_RECOGNITION_PHASE1_IMPLEMENTATION.md`](./FACE_RECOGNITION_PHASE1_IMPLEMENTATION.md)
- Phase 1: Face detection implementation
- AWS Rekognition integration
- Database schema for face storage

#### [`FACE_RECOGNITION_PHASE2_IMPLEMENTATION.md`](./FACE_RECOGNITION_PHASE2_IMPLEMENTATION.md)
- Phase 2: Person management and face grouping
- Vector similarity search with pgvector
- Person assignment and suggestions

#### [`AWS_REKOGNITION_INTEGRATION_SUMMARY.md`](./AWS_REKOGNITION_INTEGRATION_SUMMARY.md)
- AWS Rekognition setup and configuration
- Face detection and indexing workflows
- Fallback mode for limited permissions

### Image Processing

#### [`PHOTO_ORIENTATION_UPDATE.md`](./PHOTO_ORIENTATION_UPDATE.md)
- Photo orientation handling and EXIF data processing
- Image rotation and display corrections

#### [`ENHANCED_CROPPING_WITH_REKOGNITION.md`](./ENHANCED_CROPPING_WITH_REKOGNITION.md)
- Intelligent cropping using AWS Rekognition
- Face-aware cropping for better composition

#### [`ENHANCED_FACE_PRESERVATION_IMPROVEMENTS.md`](./ENHANCED_FACE_PRESERVATION_IMPROVEMENTS.md)
- Face preservation during image processing
- Enhanced face detection and cropping

### PDF & Content Generation

#### [`PROMPT_CHANGE_REGENERATION.md`](./PROMPT_CHANGE_REGENERATION.md)
- Prompt changes for AI content regeneration
- Regeneration workflows and triggers

#### [`RECREATION_DIFFERENT_PHOTOS.md`](./RECREATION_DIFFERENT_PHOTOS.md)
- Memory book recreation with different photos
- Photo replacement workflows

#### [`STORY_TEXT_RENDERING_IMPROVEMENTS.md`](./STORY_TEXT_RENDERING_IMPROVEMENTS.md)
- Story text rendering enhancements
- Typography and layout improvements

#### [`PDF_ROTATION_AND_POSITIONING.md`](./PDF_ROTATION_AND_POSITIONING.md)
- Rotated image positioning in PDF generation
- Coordinate system conversions (CSS vs pdf-lib)
- Mathematical compensation for rotation origin differences

### Mobile & UI

#### [`MOBILE_PDF_FULLSCREEN_FIX.md`](./MOBILE_PDF_FULLSCREEN_FIX.md)
- Mobile PDF viewer fullscreen fixes
- Touch interaction improvements

#### [`PDF_VIEWER_PANNING_ENHANCEMENT.md`](./PDF_VIEWER_PANNING_ENHANCEMENT.md)
- PDF viewer panning enhancements
- Gesture control improvements

### Analytics

#### [`ANALYTICS_PHASE2.md`](./ANALYTICS_PHASE2.md)
- Analytics system Phase 2 enhancements
- User tracking and geolocation
- IP-API integration (replaced MapBox)

### User Management

#### [`USER_DELETION_FEATURE.md`](./USER_DELETION_FEATURE.md)
- User deletion and data cleanup
- Soft delete implementation
- Backup creation before deletion

### API & Services

#### [`API_TESTING_GUIDE.md`](./API_TESTING_GUIDE.md)
- Comprehensive API testing guide
- Face recognition endpoint testing
- Authentication and validation testing

#### [`ZIP_CODE_API_OPTIONS.md`](./ZIP_CODE_API_OPTIONS.md)
- ZipCodeAPI setup and configuration
- Distance calculation options
- Free tier usage and limits

## 📖 How to Use This Documentation

### For New Developers

1. **Start with architecture**: Read [`architecture.mermaid`](./architecture.mermaid)
2. **Technical overview**: Review [`technical.md`](./technical.md)
3. **Environment setup**: Follow [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md)
4. **PrimeVue setup**: Check [`PRIMEVUE_SETUP.md`](./PRIMEVUE_SETUP.md)

### For Feature Development

- **Memory Books**: [`MEMORY_BOOK_FEATURES.md`](./MEMORY_BOOK_FEATURES.md) for overview
- **Memory Books Implementation**: [`MEMORY_BOOKS_PAGE_FLOW.md`](./MEMORY_BOOKS_PAGE_FLOW.md) for technical details
- **Location Features**: [`LOCATION_BASED_PHOTO_SELECTION.md`](./LOCATION_BASED_PHOTO_SELECTION.md)
- **Face Recognition**: [`FACE_RECOGNITION_PHASE1_IMPLEMENTATION.md`](./FACE_RECOGNITION_PHASE1_IMPLEMENTATION.md) and Phase 2
- **Image Processing**: [`PHOTO_ORIENTATION_UPDATE.md`](./PHOTO_ORIENTATION_UPDATE.md)

### For Deployment & Operations

- **Complete setup**: [`technical.md`](./technical.md)
- **Railway deployment**: See Railway section in [`technical.md`](./technical.md)
- **DNS configuration**: See DNS section in [`technical.md`](./technical.md)
- **Environment variables**: See Environment Variables section in [`technical.md`](./technical.md)

### For Troubleshooting

- **Technical issues**: Check [`technical.md`](./technical.md) Troubleshooting section
- **PrimeVue problems**: [`PRIMEVUE_SETUP.md`](./PRIMEVUE_SETUP.md)
- **Environment issues**: [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md)

## 🔗 Related Resources

- **Project README**: [`../README.md`](../README.md) - Project overview and quick start
- **Test Documentation**: [`../tests/README.md`](../tests/README.md) - Test files and procedures
- **Railway Guide**: [`../readme-railway.md`](../readme-railway.md) - Railway debugging and deployment
- **Code Comments**: Inline documentation in source files
- **API Documentation**: Endpoint documentation in `server/api/` files

## 📝 Documentation Standards

### Creating New Documentation

When adding new documentation:

1. **Clear purpose**: State the document's purpose at the top
2. **Target audience**: Identify who the document is for
3. **Code examples**: Include practical code snippets
4. **Step-by-step**: Provide clear instructions for processes
5. **Update index**: Add new documents to this README

### Maintaining Documentation

- **Keep current**: Update docs when code changes
- **Check consistency**: Ensure consistency with [`technical.md`](./technical.md)
- **Cross-reference**: Link to related documentation
- **Review regularly**: Periodic documentation audits

### Documentation Hierarchy

1. **Primary**: [`architecture.mermaid`](./architecture.mermaid), [`technical.md`](./technical.md) - Complete system reference
2. **Setup**: Environment, PrimeVue, database configuration
3. **Features**: Individual feature documentation
4. **Troubleshooting**: Problem-specific guides

## 🔍 Documentation Categories

### Architecture & Technical (★ Start Here)
- `architecture.mermaid` - System architecture diagram
- `technical.md` - Complete technical specifications

### Setup & Configuration
- `ENVIRONMENT_SETUP.md` - Environment variables
- `PRIMEVUE_SETUP.md` - UI framework setup
- `MCP_SERVER_SETUP.md` - Cursor AI database access
- `BACKUP_STORAGE_SETUP.md` - Backup configuration

### Core Features
- `MEMORY_BOOK_FEATURES.md` - Feature overview
- `MEMORY_BOOKS_PAGE_FLOW.md` - Technical implementation
- `MEMORY_STUDIO_REFACTOR_SUMMARY.md` - Architecture summary

### Photo & AI Features
- `LOCATION_BASED_PHOTO_SELECTION.md` - Location hierarchy
- `AI_PHOTO_SELECTION_REASONING.md` - AI selection logic
- `ATTRIBUTE_BASED_PHOTO_SELECTION.md` - Attribute filtering
- `ENHANCED_PHOTO_SELECTION.md` - Advanced selection

### Face Recognition
- `FACE_RECOGNITION_PHASE1_IMPLEMENTATION.md` - Phase 1
- `FACE_RECOGNITION_PHASE2_IMPLEMENTATION.md` - Phase 2
- `AWS_REKOGNITION_INTEGRATION_SUMMARY.md` - AWS setup

### Image & PDF Processing
- `PHOTO_ORIENTATION_UPDATE.md` - Orientation handling
- `ENHANCED_CROPPING_WITH_REKOGNITION.md` - Smart cropping
- `ENHANCED_FACE_PRESERVATION_IMPROVEMENTS.md` - Face preservation
- `STORY_TEXT_RENDERING_IMPROVEMENTS.md` - Text rendering
- `PROMPT_CHANGE_REGENERATION.md` - Content regeneration
- `RECREATION_DIFFERENT_PHOTOS.md` - Photo replacement

### Mobile & UI
- `MOBILE_PDF_FULLSCREEN_FIX.md` - Mobile PDF viewer
- `PDF_VIEWER_PANNING_ENHANCEMENT.md` - PDF gestures

### Analytics & Admin
- `ANALYTICS_PHASE2.md` - Analytics system
- `USER_DELETION_FEATURE.md` - User management

### APIs & Services
- `API_TESTING_GUIDE.md` - API testing
- `ZIP_CODE_API_OPTIONS.md` - Location services
- `LOCATION_AWARE_STORY_GENERATION.md` - Story generation
- `LOCATION_FEATURE_UPDATE.md` - Location updates

## 💡 Tips for Developers

### Before Making Changes
1. ✅ Read [`architecture.mermaid`](./architecture.mermaid) to understand system architecture
2. ✅ Review [`technical.md`](./technical.md) for technical constraints
3. ✅ Check `.cursorrules` for coding conventions
4. ✅ Review relevant feature documentation

### When Adding Features
1. ✅ Update [`architecture.mermaid`](./architecture.mermaid) if architecture changes
2. ✅ Create feature documentation in `docs/`
3. ✅ Update this README with new documentation links
4. ✅ Add examples and code snippets

### After Changes
1. ✅ Update affected documentation
2. ✅ Run linting and tests
3. ✅ Verify consistency with [`technical.md`](./technical.md)
4. ✅ Update deployment notes if needed

---

**Last Updated**: 2025-01-10  
**Documentation Version**: 2.0  
**Project**: Savta.ai Memory Books & Cards
