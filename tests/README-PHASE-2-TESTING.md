# Phase 2 Testing Guide - Thumbnail Generation

## Overview

Phase 2 implements automatic thumbnail generation when users upload photos. This guide explains how to test the implementation.

## What Phase 2 Does

When a user uploads a photo via `/app/upload`:
1. ✅ Full-resolution image uploaded to `assets/{user_id}/{filename}`
2. ✅ Thumbnail generated (400px wide, WebP format, 80% quality)
3. ✅ Thumbnail uploaded to `assets/{user_id}/thumbnails/{filename}.webp`
4. ✅ Asset record updated with `thumbnail_url`, `thumbnail_width`, `thumbnail_height`

## Quick Test (2 minutes)

### Step 1: Upload a Photo

1. Go to `http://localhost:3000/app/upload`
2. Upload a test photo (any image file)
3. Wait for upload to complete

### Step 2: Verify Thumbnail Generated

Using `susql` (see `README.md` lines 765-800 for setup):

```bash
# Check if thumbnail was created
susql -c "SELECT 
  id,
  thumbnail_url IS NOT NULL as has_thumbnail,
  thumbnail_width,
  thumbnail_height,
  created_at
FROM assets 
WHERE deleted = false 
  AND type = 'photo'
ORDER BY created_at DESC 
LIMIT 1;"
```

**Expected Result:**
```
has_thumbnail | t
thumbnail_width  | 400 (or less if original was small)
thumbnail_height | (calculated from aspect ratio)
```

✅ If you see `has_thumbnail = t` → **Phase 2 Working!**

## Comprehensive Test

Run the full test suite:

```bash
susql -f tests/thumbnail-generation-test.sql
```

This will verify:
- ✅ Thumbnails are being generated for new uploads
- ✅ Thumbnail storage paths are correct (`/thumbnails/` subfolder)
- ✅ Thumbnails use WebP format
- ✅ Thumbnail dimensions are correct (400px width)
- ✅ Both `storage_url` and `thumbnail_url` are present
- ✅ Performance impact estimation

## What to Look For

### Success Indicators ✅

1. **Thumbnail URL Present**
   - `thumbnail_url` field is NOT NULL for new uploads
   - URL contains `/thumbnails/` in the path
   - URL ends with `.webp`

2. **Correct Dimensions**
   - `thumbnail_width = 400` (or less if original was smaller)
   - `thumbnail_height` calculated to maintain aspect ratio

3. **Both URLs Present**
   - `storage_url` → Full resolution (unchanged)
   - `thumbnail_url` → Optimized thumbnail (new)

4. **Console Logs** (check browser console during upload)
   ```
   🖼️ Generating thumbnail for uploaded image...
   ✅ Thumbnail generated: {
     url: "...",
     dimensions: "400x300",
     compression: "2.1%"
   }
   ```

### Failure Indicators ❌

1. **No Thumbnail URL**
   - `thumbnail_url IS NULL` for new uploads
   - Check browser console for errors
   - Check server logs

2. **Wrong Format**
   - Thumbnail URL doesn't end with `.webp`
   - Wrong dimensions (not 400px width)

3. **Upload Errors**
   - Photo fails to upload entirely
   - Check API errors in network tab

## Troubleshooting

### Issue: Thumbnails Not Generated

**Check 1: Server Logs**
```bash
# Check for thumbnail generation errors
grep "Thumbnail" /path/to/logs
```

**Check 2: Sharp Library**
```bash
# Verify Sharp is installed
cd /home/irvshapiro/drvax_code/savta-ai && npm list sharp
```

Should show: `sharp@0.33.5`

**Check 3: API Route**
```bash
# Test the API directly
curl -X POST http://localhost:3000/api/images/generate-thumbnail \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"YOUR_IMAGE_URL","userId":"YOUR_USER_ID","originalFileName":"test.jpg"}'
```

### Issue: Upload Fails Completely

**Cause:** Thumbnail generation error is blocking upload  
**Solution:** Thumbnail generation is non-critical and wrapped in try-catch. Check:
1. Database errors (not thumbnail-related)
2. Storage permissions
3. Network connectivity

### Issue: Thumbnails Generated But Wrong Size

**Cause:** Sharp configuration issue  
**Solution:** Check `generate-thumbnail.post.js`:
- Width should be 400
- `fit: 'inside'` maintains aspect ratio
- `withoutEnlargement: true` prevents upscaling

### Issue: Performance Not Improved

**Cause:** UI not using thumbnails yet (Phase 3)  
**Solution:** Phase 2 only generates thumbnails. Phase 3 updates UI to use them.

## Manual Testing Checklist

- [ ] Upload a photo through `/app/upload`
- [ ] Verify `thumbnail_url` is populated in database
- [ ] Verify thumbnail file exists in Supabase Storage
- [ ] Verify thumbnail is in `/thumbnails/` subfolder
- [ ] Verify thumbnail is WebP format (`.webp` extension)
- [ ] Verify thumbnail width is 400px (or less for small originals)
- [ ] Verify `storage_url` still points to full resolution
- [ ] Verify console shows thumbnail generation logs
- [ ] Upload fails gracefully if thumbnail generation fails
- [ ] Old assets without thumbnails still work (backward compatible)

## Test Data

### Test Photos to Upload

Use photos with different characteristics:

1. **Large Photo** (>5MB) - Tests compression + thumbnail
2. **Small Photo** (<1MB) - Tests thumbnail generation
3. **Portrait Photo** (tall) - Tests aspect ratio
4. **Landscape Photo** (wide) - Tests aspect ratio
5. **Square Photo** (1:1) - Tests aspect ratio
6. **Very Small Photo** (<400px) - Tests no upscaling

## Expected Performance Impact

After Phase 2 (thumbnail generation):
- **Storage:** +1-2% (thumbnails add ~30KB per photo)
- **Upload Time:** +0.5-1 second (thumbnail generation)
- **Page Load:** No change yet (Phase 3 will improve this)

After Phase 3 (UI integration):
- **Page Load:** ~67x faster (24MB → 360KB for 12 cards)

## Database Queries for Testing

### Check Latest Upload

```bash
susql -c "SELECT id, storage_url, thumbnail_url, thumbnail_width, thumbnail_height, created_at 
FROM assets 
WHERE deleted = false AND type = 'photo' 
ORDER BY created_at DESC 
LIMIT 1;"
```

### Count Thumbnail Coverage

```bash
susql -c "SELECT 
  COUNT(*) as total_photos,
  COUNT(thumbnail_url) as with_thumbnails,
  ROUND(COUNT(thumbnail_url)::numeric / COUNT(*)::numeric * 100, 1) || '%' as coverage
FROM assets 
WHERE deleted = false AND type = 'photo';"
```

### Find Photos Without Thumbnails

```bash
susql -c "SELECT id, storage_url, created_at 
FROM assets 
WHERE deleted = false 
  AND type = 'photo' 
  AND thumbnail_url IS NULL 
ORDER BY created_at DESC 
LIMIT 10;"
```

### Verify Thumbnail Paths

```bash
susql -c "SELECT 
  id,
  thumbnail_url LIKE '%/thumbnails/%' as correct_path,
  thumbnail_url LIKE '%.webp' as correct_format
FROM assets 
WHERE deleted = false 
  AND type = 'photo' 
  AND thumbnail_url IS NOT NULL 
LIMIT 10;"
```

## Success Criteria

Phase 2 is successful when:

- [x] API route `/api/images/generate-thumbnail.post.js` created
- [x] Sharp library integrated for image processing
- [x] `uploadAsset` composable calls thumbnail generation
- [x] Database stores `thumbnail_url`, `thumbnail_width`, `thumbnail_height`
- [ ] Test upload creates thumbnail successfully ⬅️ **Test This**
- [ ] Thumbnail stored in correct path (`/thumbnails/`)
- [ ] Thumbnail uses WebP format
- [ ] Thumbnail dimensions correct (400px width)
- [ ] Upload succeeds even if thumbnail generation fails
- [ ] Old assets without thumbnails still work

## Next Steps

After Phase 2 is verified:
1. ✅ Thumbnails are generated for new uploads
2. ✅ Database stores thumbnail information
3. 🔜 **Phase 3:** Update UI to use thumbnails (performance improvement)
4. 🔜 **Phase 4:** Verify PDF generation still uses full resolution
5. 🔜 **Phase 5:** Backfill thumbnails for existing assets (optional)

## Related Documentation

- Phase 1: `tests/README-THUMBNAIL-TESTS.md` - Database schema
- Architecture: `docs/thumbnail-architecture.md` - Complete specification
- API: `server/api/images/generate-thumbnail.post.js` - Thumbnail generation
- Upload: `composables/useDatabase.js` - Integration point

---

**Last Updated:** 2025-10-21  
**Status:** Phase 2 Implementation Complete, Ready for Testing  
**Next:** Upload test photo and run verification queries

