# Thumbnail Architecture for Savta.ai

## Overview

This document describes the thumbnail architecture for optimizing UI performance while maintaining full-resolution images for PDF generation.

## Problem Statement

Currently, the application loads full-resolution images (500KB-3MB each) for UI display, causing:
- Slow page loads (24MB for 12 cards)
- Poor mobile performance
- High bandwidth usage

## Solution

Implement a dual-storage system:
- **Thumbnails** (400px WebP @ 80% quality, ~30KB) → UI display only
- **Full Resolution** (original files) → PDF generation only (300 DPI print quality)

## Database Schema Changes

### Assets Table - New Fields

```sql
-- Added to assets table in schema.sql
thumbnail_url text,              -- URL to thumbnail (nullable for backward compatibility)
thumbnail_width integer DEFAULT 400,  -- Standard thumbnail width
thumbnail_height integer         -- Calculated from aspect ratio
```

### Storage Structure

```
assets/
├── {user_id}/
│   ├── {timestamp}-{filename}.jpg          # Full resolution (UNCHANGED)
│   └── thumbnails/
│       └── {timestamp}-{filename}.webp     # New thumbnail (400px wide)
```

## Key Architectural Decisions

### 1. **No Breaking Changes**
- ✅ Full-resolution `storage_url` field remains unchanged
- ✅ `thumbnail_url` is nullable (NULL = use storage_url fallback)
- ✅ Existing code continues to work without modification
- ✅ Old assets display correctly without thumbnails

### 2. **PDF Generation Safety** ⚠️ CRITICAL
```javascript
// PDF generation MUST use storage_url (full resolution)
const imageUrl = asset.storage_url  // ✅ Correct
const imageUrl = asset.thumbnail_url  // ❌ NEVER use for PDFs
```

**Why:** Thumbnails are 400px wide, which would result in poor print quality at 300 DPI. Full-resolution images are required for professional print output.

### 3. **UI Performance Optimization**
```javascript
// UI components should prefer thumbnails when available
const displayUrl = asset.thumbnail_url || asset.storage_url  // ✅ Correct pattern
```

**Performance Improvement:**
- Before: 12 cards × 2MB = 24MB page load
- After: 12 cards × 30KB = 360KB page load
- **~67x faster**

## Implementation Phases

### Phase 1: Database Foundation ✅ COMPLETED
- [x] Add `thumbnail_url`, `thumbnail_width`, `thumbnail_height` to schema.sql
- [x] Add safe migration block (backward compatible)
- [x] Add database index for thumbnail queries
- [x] Add database comments documenting usage
- [x] Test with `susql` (see Testing section below)
- [x] Verified on 181 existing assets (all backward compatible)

### Phase 2: Thumbnail Generation ✅ COMPLETED
- [x] Create thumbnail generation API route (`/api/images/generate-thumbnail.post.js`)
- [x] Integrate Sharp library for image processing (400px wide, WebP, 80% quality)
- [x] Update `uploadAsset` composable to generate thumbnails automatically
- [x] Handle errors gracefully (thumbnail generation is non-critical)
- [x] Store thumbnails in `/thumbnails/` subfolder
- [x] Test suite created (`tests/thumbnail-generation-test.sql`)

**Testing:** Upload a photo and run `susql -f tests/thumbnail-generation-test.sql`

### Phase 3: UI Integration (Next Steps)
1. Update `useMemoryStudio.js` to prefer thumbnails when loading
2. Modify components to use `thumbnail_url || storage_url` pattern
3. Update `getAssetsByBook` to include thumbnail_url in SELECT
4. Test performance improvements with thumbnails

### Phase 4: PDF Safety Verification
1. Review all PDF generation code
2. Add explicit checks to ensure `storage_url` usage
3. Add unit tests to prevent thumbnail usage in PDFs

### Phase 5: Optional Backfill
1. Create batch thumbnail generator for existing assets
2. Add progress tracking in admin dashboard
3. Monitor and verify generation

## Technical Specifications

### Thumbnail Generation

| Property | Value | Reasoning |
|----------|-------|-----------|
| Width | 400px | Optimal for UI cards and grids |
| Format | WebP | 25-35% smaller than JPEG, excellent browser support |
| Quality | 80% | Imperceptible quality loss, significant size reduction |
| Aspect Ratio | Preserved | Maintains original photo proportions |
| Estimated Size | 15-40KB | vs 500KB-3MB for full resolution |

### Storage Paths

**Full Resolution (unchanged):**
```
assets/{user_id}/{timestamp}-photo.jpg
```

**Thumbnail (new):**
```
assets/{user_id}/thumbnails/{timestamp}-photo.webp
```

## Code Integration Points

### 1. Database Composable (`composables/useDatabase.js`)
```javascript
// After uploading full-resolution image
const thumbnailResult = await generateAndUploadThumbnail(file, user.value.id)
assetRecord.thumbnail_url = thumbnailResult.publicUrl
assetRecord.thumbnail_width = 400
assetRecord.thumbnail_height = thumbnailResult.height
```

### 2. Memory Studio (`composables/useMemoryStudio.js`)
```javascript
// Prefer thumbnails for UI display
const getAssetThumbnail = (assetId) => {
  const asset = assetThumbnails.value[assetId]
  return asset?.thumbnail_url || asset?.storage_url || null
}
```

### 3. PDF Generation (`server/api/memory-books/generate-pdf/[id].post.js`)
```javascript
// CRITICAL: Always use full resolution for PDFs
const { data: assets } = await supabase
  .from('assets')
  .select('id, storage_url')  // ✅ Only select storage_url, not thumbnail_url
  .in('id', book.created_from_assets)

// Use storage_url for image fetching
const imageBuffer = await fetchImage(asset.storage_url)  // ✅ Full resolution
```

### 4. UI Components
```vue
<!-- Prefer thumbnail_url when available -->
<img 
  :src="asset.thumbnail_url || asset.storage_url" 
  :alt="asset.user_caption || 'Photo'"
  loading="lazy"
/>
```

## Backward Compatibility

### Existing Assets (No Thumbnails)
```javascript
// Graceful fallback
const displayUrl = asset.thumbnail_url || asset.storage_url
// If thumbnail_url is NULL, uses storage_url automatically
```

### New Uploads
```javascript
// Generate both full resolution and thumbnail
const asset = await uploadAsset({...}, file)
// asset.storage_url = full resolution
// asset.thumbnail_url = optimized thumbnail
```

## Performance Metrics

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Page Load (12 cards) | 24MB | 360KB | 67x faster |
| Initial Render | 3-5s | <500ms | 6-10x faster |
| Mobile Data Usage | High | Low | 67x reduction |
| Time to Interactive | 4-6s | <1s | 4-6x faster |

### Storage Impact

| Item | Full Resolution | Thumbnail | Ratio |
|------|----------------|-----------|-------|
| Single Photo | 1-3MB | 20-40KB | ~50-75x |
| 100 Photos | 100-300MB | 2-4MB | ~50-75x |

**Note:** Thumbnails add only ~1-2% to total storage costs while providing massive performance benefits.

## Security & Access Control

### Storage Bucket Policy
Both full-resolution and thumbnail images use the same RLS policies:
- User-specific folders: `assets/{user_id}/...`
- Supabase Storage RLS enforces access control
- Thumbnails inherit security from parent folder

### API Authentication
Thumbnail generation happens server-side:
- Requires valid JWT token
- User ownership verified before generation
- Service role key used for storage operations

## Monitoring & Maintenance

### Success Metrics
- [ ] Average page load time < 1 second
- [ ] 90% of assets have thumbnails within 1 week
- [ ] Zero PDF quality complaints
- [ ] Mobile user satisfaction increase

### Maintenance Tasks
1. **Weekly:** Check thumbnail generation success rate
2. **Monthly:** Review storage costs and optimization opportunities
3. **Quarterly:** Audit PDF generation to ensure full-resolution usage
4. **As needed:** Backfill thumbnails for old assets

## Testing Database Changes

### Using `susql` (Recommended)

**What is `susql`?** A bash alias for running PostgreSQL commands against your cloud Supabase database. See `README.md` (lines 765-800) for setup.

```bash
# Apply schema migration
susql -f supabase/schema.sql

# Verify columns exist
susql -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assets' AND column_name LIKE 'thumbnail%';"

# Run test suite
susql -f tests/thumbnail-schema-test.sql

# Check existing assets
susql -c "SELECT COUNT(*), COUNT(thumbnail_url) as with_thumbnails FROM assets WHERE deleted = false;"
```

### Test Files

- `tests/thumbnail-schema-test.sql` - SQL-based comprehensive tests
- `tests/thumbnail-schema-test.js` - Node.js automated tests
- `tests/README-THUMBNAIL-TESTS.md` - Complete testing guide

## Troubleshooting

### Issue: Old Assets Not Displaying
**Cause:** Thumbnail doesn't exist, fallback not working
**Solution:** Check `thumbnail_url || storage_url` pattern in component

### Issue: PDF Quality Poor
**Cause:** Accidentally using thumbnail_url instead of storage_url
**Solution:** Review PDF generation code, ensure storage_url usage

### Issue: Slow Thumbnail Generation
**Cause:** Processing too many images concurrently
**Solution:** Implement queue system with concurrency limit

### Issue: Storage Costs Increasing
**Cause:** Generating thumbnails for all images
**Solution:** This is expected; thumbnails add ~1-2% storage cost

## Future Enhancements

### Possible Improvements (Future)
1. **Multiple Thumbnail Sizes:** 200px, 400px, 800px for different use cases
2. **Lazy Generation:** Generate thumbnails on-demand rather than on upload
3. **CDN Integration:** Serve thumbnails from CDN for even faster loads
4. **Progressive Loading:** Show low-quality placeholder while loading
5. **WebP Fallback:** Serve JPEG for browsers without WebP support

### Not Recommended
- ❌ Using thumbnails for PDF generation (quality loss)
- ❌ Replacing full-resolution storage (needed for PDFs)
- ❌ Making thumbnail_url non-nullable (breaks existing assets)

## References

### Files Modified
- `supabase/schema.sql` - Database schema changes
- `docs/thumbnail-architecture.md` - This document

### Files to Modify (Phase 2-4)
- `composables/useDatabase.js` - Thumbnail generation integration
- `composables/useMemoryStudio.js` - Thumbnail loading logic
- `server/api/images/generate-thumbnail.post.js` - New thumbnail API
- `components/MemoryCard.vue` - Use thumbnails for display
- `components/PhotoSelectionInterface.vue` - Use thumbnails in grids
- `server/api/memory-books/generate-pdf/[id].post.js` - Verify storage_url usage

### Related Documentation
- Architecture Diagram: `docs/architecture.mermaid`
- Technical Specs: `docs/technical.md`
- Project Rules: Repo-specific rules (see workspace)

## Questions & Answers

**Q: Will this break existing code?**
A: No. The thumbnail_url field is nullable, and all existing code uses storage_url, which remains unchanged.

**Q: What happens to old photos without thumbnails?**
A: They continue to work exactly as before using storage_url. The UI code uses `thumbnail_url || storage_url` for graceful fallback.

**Q: Can we use thumbnails for PDFs to save processing time?**
A: **NO.** Thumbnails are 400px wide, which would result in poor print quality at 300 DPI. PDFs MUST use full-resolution images from storage_url.

**Q: How much storage will thumbnails add?**
A: Approximately 1-2% of current storage usage. A 2MB photo creates a ~30KB thumbnail.

**Q: When will users see performance improvements?**
A: Immediately for new uploads (Phase 2+). Old assets improve gradually as thumbnails are generated (Phase 5).

**Q: What if thumbnail generation fails?**
A: The asset record is created with NULL thumbnail_url, and the UI falls back to storage_url automatically.

---

**Last Updated:** 2025-10-21
**Status:** Phase 1 Complete (Database Schema)
**Next Steps:** Phase 2 (Thumbnail Generation API)

