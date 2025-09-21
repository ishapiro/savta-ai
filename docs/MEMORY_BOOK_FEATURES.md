# Savta.ai Memory Book Features

This document describes the comprehensive memory book features implemented for Savta.ai, a Nuxt 3 + Supabase application for collecting family memories and generating memory books.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Nuxt 3, PrimeVue 3.x, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI Processing**: OpenAI API (GPT-4 Vision for images, GPT-4 for text)
- **Deployment**: Vercel

### Database Schema
The application uses a comprehensive database schema with the following key tables:
- `profiles` - User profiles with roles (user, editor, admin)
- `families` - Family relationships and delivery preferences
- `memory_preferences` - Book generation settings
- `assets` - Photos and text stories with AI processing
- `memory_books` - Generated memory books
- `activity_log` - User activity tracking
- `tags` & `asset_tags` - Tagging system

## 🚀 Core Features

### 1. Asset Upload & AI Processing

**Location**: `/app/upload`

**Features**:
- **Photo Upload**: Drag & drop or click to upload images (PNG, JPG, GIF up to 10MB)
- **Text Stories**: Share family stories with titles and captions
- **AI Processing**: Automatic caption generation, tagging, and people/object detection
- **Real-time Progress**: Upload progress with AI processing status
- **Recent Uploads**: Grid view of recently uploaded assets

**AI Capabilities**:
- Image analysis using OpenAI Vision API
- Text story analysis and caption generation
- Automatic tagging (family, events, emotions, activities)
- People and object detection in photos

### 2. Review & Approval System

**Location**: `/app/review`

**Features**:
- **Asset Management**: View all uploaded assets with filtering and sorting
- **Approval Workflow**: Approve/reject assets for memory book inclusion
- **Caption Editing**: Edit user captions and view AI-generated captions
- **Statistics Dashboard**: Overview of total, pending, approved, and ready assets
- **Memory Book Generation**: Create memory books from approved assets

**Filters**:
- Status: All, Pending, Approved, Rejected
- Type: Photos, Stories, All Types
- Sort: Newest, Oldest, By Type

### 3. Memory Book Management

**Location**: `/app/memory-books`

**Features**:
- **Book Creation**: Configure layout, page count, print size, quality, medium
- **AI Photo Selection**: Intelligent photo selection based on themes and prompts
- **PDF Generation**: Generate PDFs with progress tracking and status updates
- **Book Status Tracking**: Draft, Ready, Approved, Distributed
- **Download System**: Download generated PDFs
- **Book Details**: View comprehensive book information and metadata
- **Progress Dialog**: Real-time progress tracking with shared component
- **Grid/List Views**: Toggle between different viewing modes

**Book Configuration Options**:
- Layout Types: Grid (2x2, 3x3, 4x4), Theme-based layouts
- Print Sizes: 8.5x11, A4, A5, Letter, Square
- Quality Levels: Standard, Premium, Ultra
- Medium: Digital, Print, Both
- Photo Selection: Manual selection or AI-driven selection

**Technical Implementation**:
- **Complex State Management**: Multiple composables managing reactive state
- **Progress Dialog Integration**: Shared component with magic wizard
- **Event-Driven Architecture**: Custom events for cross-component communication
- **Mobile-First Design**: Responsive layout with touch-friendly interactions
- **Performance Optimizations**: Lazy loading, debounced search, memoized computations

> **📋 For detailed technical implementation**: See `MEMORY_BOOKS_PAGE_FLOW.md` for comprehensive documentation of the complex component interactions, reactive state management, and event flows.

### 4. Admin Interface

**Location**: `/app/admin`

**Features**:
- **User Management**: View all users, update roles, soft delete/restore
- **System Administration**: System information, quick actions, activity logs
- **Role-based Access**: Admin-only access with role verification
- **Statistics Dashboard**: User counts, memory books, assets overview

**Admin Capabilities**:
- View all users and their profiles
- Change user roles (user, editor, admin)
- Soft delete and restore users
- Generate system reports
- Clear system cache
- Backup database

### 5. Editor Interface

**Location**: `/app/admin`

**Features**:
- **Asset Review**: Review and approve/reject user-submitted assets
- **Book Review**: Review memory books and approve for distribution
- **Theme Management**: Create and manage memory book themes
- **Editor Statistics**: Pending assets, reviewed assets, memory books, active themes

**Editor Capabilities**:
- Review all user assets with user information
- Approve/reject assets with comments
- Review memory books and approve for distribution
- Manage book themes and layouts
- Activate/deactivate themes

## 🔐 Authentication & Authorization

### Middleware System
- **`auth.js`**: Ensures users are logged in for protected routes
- **`admin.js`**: Restricts access to admin-only pages
- **`editor.js`**: Allows access to editor and admin users

### Role-based Access Control
- **User**: Upload assets, review own assets, create memory books
- **Editor**: Review all assets, manage themes, approve memory books
- **Admin**: Full system access, user management, system administration

## 🗄️ Database Operations

### Shared Database Library (`composables/useDatabase.js`)

**Core Functions**:
- `getCurrentProfile()` - Get current user's profile
- `logActivity()` - Log user activities

**Profile Operations**:
- `profile.getProfile()` - Get user profile
- `profile.updateProfile()` - Update profile
- `profile.createProfile()` - Create profile

**Family Operations**:
- `family.getFamilies()` - Get user's families
- `family.createFamily()` - Create family
- `family.updateFamily()` - Update family
- `family.deleteFamily()` - Soft delete family

**Asset Operations**:
- `assets.getAssets()` - Get user's assets with filters
- `assets.uploadAsset()` - Upload asset with file
- `assets.updateAsset()` - Update asset
- `assets.approveAsset()` - Approve/reject asset
- `assets.deleteAsset()` - Soft delete asset

**Memory Book Operations**:
- `memoryBooks.getMemoryBooks()` - Get user's memory books
- `memoryBooks.createMemoryBook()` - Create memory book
- `memoryBooks.updateMemoryBook()` - Update memory book
- `memoryBooks.generateMemoryBook()` - Generate from approved assets

**Admin Operations**:
- `admin.getAllUsers()` - Get all users (admin only)
- `admin.updateUserRole()` - Update user role (admin only)
- `admin.deleteUser()` - Soft delete user (admin only)

**Editor Operations**:
- `editor.getAllAssetsForReview()` - Get all assets for review
- `editor.getAllMemoryBooksForReview()` - Get all books for review

## 🤖 AI Integration

### AI Processing Endpoint (`server/api/ai/process-asset.post.js`)

**Features**:
- **Image Analysis**: Uses OpenAI Vision API for photo analysis
- **Text Analysis**: Uses GPT-4 for story analysis
- **Automatic Tagging**: Generates relevant tags for assets
- **Caption Generation**: Creates playful, meaningful captions
- **People/Object Detection**: Identifies people and objects in photos

**Processing Flow**:
1. Asset uploaded to Supabase Storage
2. AI processing triggered via API endpoint
3. OpenAI analyzes image/text content
4. Results stored in database (captions, tags, people detected)
5. Asset marked as processed

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Purple-based theme with consistent color coding
- **Component Library**: PrimeVue components with Tailwind styling
- **Responsive Design**: Mobile-first approach with responsive grids
- **Loading States**: Progress indicators for uploads and processing
- **Toast Notifications**: User feedback for all actions

### Navigation
- **Role-based Navigation**: Different navigation items based on user role
- **Mobile-friendly**: Responsive navigation with mobile menu
- **Breadcrumbs**: Contextual navigation breadcrumbs
- **Active States**: Visual feedback for current page

## 🔧 Configuration

### Environment Variables
```bash
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Site Configuration
NUXT_PUBLIC_SITE_URL=http://localhost:3000
INSIDER_PASSWORD=savta2025
```

### Runtime Configuration
- OpenAI API key configured for server-side use
- Supabase client configured for client-side use
- Build information and site configuration

## 📊 Activity Tracking

### Comprehensive Logging
All user actions are logged in the `activity_log` table:
- Asset uploads and processing
- Asset approvals/rejections
- Memory book creation and generation
- User role changes
- System administration actions

### Log Structure
```javascript
{
  user_id: 'uuid',
  action: 'asset_uploaded',
  timestamp: '2024-01-15T10:30:00Z',
  details: {
    assetId: 'uuid',
    type: 'photo',
    hasFile: true
  }
}
```

## 🚀 Deployment

### Vercel Deployment
- Automatic deployment from Git repository
- Environment variables configured in Vercel dashboard
- Supabase storage bucket configured for asset uploads
- OpenAI API key configured for AI processing

### Database Setup
1. Run Supabase schema migration
2. Configure RLS policies
3. Set up storage buckets
4. Configure triggers and functions

## 🔍 Testing

### Development Tools
- **Seed API**: `/api/seed` for populating test data
- **Mock Data**: Sample users, assets, and memory books
- **Development Mode**: Enhanced logging and debugging

### Sample Data
- Admin, Editor, and Regular user accounts
- Sample families and preferences
- Test assets with AI processing
- Memory books in various states

## 📈 Future Enhancements

### Planned Features
- **PDF Generation**: Actual PDF generation with layouts
- **Email Notifications**: User notifications for book completion
- **Advanced AI**: More sophisticated image analysis
- **Bulk Operations**: Batch asset processing
- **Analytics Dashboard**: Usage statistics and insights
- **Export Options**: Multiple format support
- **Collaboration**: Shared family accounts
- **Mobile App**: Native mobile application

### Technical Improvements
- **Caching**: Redis for improved performance
- **CDN**: Asset delivery optimization
- **Background Jobs**: Queue-based processing
- **Monitoring**: Application performance monitoring
- **Testing**: Comprehensive test suite

## 🛠️ Development

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run database migrations
5. Start development server: `npm run dev`

### Key Files
- `composables/useDatabase.js` - Database operations
- `server/api/ai/process-asset.post.js` - AI processing
- `pages/app/upload.vue` - Asset upload interface
- `pages/app/review.vue` - Review and approval
- `pages/app/memory-books.vue` - Memory book management
- `pages/app/admin.vue` - Admin dashboard with admin features
- `pages/app/admin.vue` - Admin interface
- `middleware/auth.js` - Authentication middleware
- `middleware/admin.js` - Admin access control
- `middleware/admin.js` - Admin access control

### Database Schema
The complete database schema is defined in `supabase/schema.sql` with:
- All required tables and relationships
- Indexes for performance
- RLS policies for security
- Triggers for automatic updates
- Functions for common operations

This comprehensive memory book system provides a complete solution for family memory collection, AI-powered organization, and beautiful memory book generation, all built on modern web technologies with a focus on user experience and scalability. 