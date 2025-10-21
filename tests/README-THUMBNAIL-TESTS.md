# Thumbnail Schema Tests - Phase 1

This directory contains tests to verify that the thumbnail architecture Phase 1 (Database Foundation) has been successfully implemented.

## Prerequisites

Before running tests, you need to apply the schema changes to your database.

## Step 1: Apply Schema Migration

You have three options for applying the migration:

### Option A: Using `susql` Command (Fastest - Recommended)

**What is `susql`?** It's a bash alias for running PostgreSQL commands against your cloud Supabase database. See `README.md` (lines 765-800) for setup instructions.

```bash
# Apply the full schema (safe to run multiple times)
susql -f supabase/schema.sql

# Verify it worked
susql -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'assets' AND column_name LIKE 'thumbnail%';"
```

**Note:** The schema is designed with `IF NOT EXISTS` checks, so it's safe to run multiple times without breaking changes.

### Option B: Using Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/schema.sql` from your project
4. Copy and run the relevant migration section (lines 604-645):

```sql
-- Add thumbnail fields to assets table (safe to rerun)
DO $$
BEGIN
  -- Add thumbnail_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'assets' 
      AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE assets ADD COLUMN thumbnail_url text CHECK (thumbnail_url IS NULL OR length(thumbnail_url) <= 1000);
  END IF;
  
  -- Add thumbnail_width column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'assets' 
      AND column_name = 'thumbnail_width'
  ) THEN
    ALTER TABLE assets ADD COLUMN thumbnail_width integer DEFAULT 400;
  END IF;
  
  -- Add thumbnail_height column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'assets' 
      AND column_name = 'thumbnail_height'
  ) THEN
    ALTER TABLE assets ADD COLUMN thumbnail_height integer;
  END IF;
END $$;

-- Add index for faster thumbnail queries (safe to rerun)
CREATE INDEX IF NOT EXISTS idx_assets_thumbnail_url ON assets(thumbnail_url) WHERE thumbnail_url IS NOT NULL;

-- Add comments for thumbnail fields
COMMENT ON COLUMN assets.thumbnail_url IS 'URL to optimized thumbnail image (400px width, WebP format) for UI display. NULL for legacy assets.';
COMMENT ON COLUMN assets.thumbnail_width IS 'Width of thumbnail in pixels (default 400px)';
COMMENT ON COLUMN assets.thumbnail_height IS 'Height of thumbnail in pixels (calculated from aspect ratio)';
COMMENT ON COLUMN assets.storage_url IS 'URL to full-resolution image. MUST be used for PDF generation to ensure print quality at 300 DPI.';
```

5. Click **Run** or press `Cmd/Ctrl + Enter`
6. Verify you see success message

### Option C: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed and prefer local development:

```bash
# Make sure you're in the project root
cd /home/irvshapiro/drvax_code/savta-ai

# Link to your Supabase project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Apply the entire schema
supabase db push
```

**Note:** The migration is safe to run multiple times due to the `IF NOT EXISTS` checks.

**Recommendation:** Use Option A (`susql`) for fastest, most direct database access.

## Step 2: Run Tests

### Test Option 1: Using `susql` (Fastest - Recommended)

Run the test script directly from your terminal:

```bash
# Run the comprehensive test suite
susql -f tests/thumbnail-schema-test.sql

# Or run quick verification
susql -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'assets' AND column_name LIKE 'thumbnail%';"
```

**What is `susql`?** A bash alias for PostgreSQL access to your cloud Supabase database. See `README.md` (lines 765-800) for setup.

### Test Option 2: SQL Test via Dashboard

Run this directly in your Supabase SQL Editor:

1. Open Supabase Dashboard → **SQL Editor**
2. Copy the entire contents of `tests/thumbnail-schema-test.sql`
3. Paste into SQL Editor
4. Click **Run**
5. Review the results in each section

**Expected Output:**
```
✅ thumbnail_url column exists
✅ thumbnail_width column exists  
✅ thumbnail_height column exists
✅ Index exists
✅ Backward compatibility confirmed
✅ ALL TESTS PASSED - Phase 1 Complete!
```

### Test Option 3: Node.js Test (Comprehensive)

Run the automated Node.js test script:

```bash
# Make sure you have environment variables set
export NUXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the test
node tests/thumbnail-schema-test.js
```

**Note:** Option 1 (`susql`) is simplest and fastest for database schema testing.

**Expected Output:**
```
🧪 Thumbnail Schema Test Suite
==================================================
✅ thumbnail_url column exists
✅ thumbnail_width column exists
✅ thumbnail_height column exists
✅ Insert with thumbnail fields
✅ Insert without thumbnail fields (backward compatible)
✅ Query with thumbnail fields succeeds
==================================================
📊 Test Summary
==================================================
✅ Passed: 12
❌ Failed: 0
📈 Success Rate: 100.0%
==================================================
```

## Step 3: Manual Verification (Optional)

You can also manually verify the changes using `susql`:

### Check Column Existence

```bash
susql -c "SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'assets' 
  AND column_name IN ('thumbnail_url', 'thumbnail_width', 'thumbnail_height')
ORDER BY column_name;"
```

Or run in Supabase SQL Editor:

```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'assets' 
  AND column_name IN ('thumbnail_url', 'thumbnail_width', 'thumbnail_height')
ORDER BY column_name;
```

### Check Existing Assets

```bash
susql -c "SELECT id, storage_url, thumbnail_url, thumbnail_width, thumbnail_height
FROM assets WHERE deleted = false LIMIT 5;"
```

### Verify Backward Compatibility

```bash
# This query should work exactly as before (no changes needed)
susql -c "SELECT id, storage_url, type, approved
FROM assets WHERE deleted = false AND approved = true LIMIT 10;"
```

**Tip:** All SQL examples above can be run either via `susql -c "query"` or in the Supabase Dashboard SQL Editor.

## What Each Test Verifies

### Test 1: Column Existence
- ✓ `thumbnail_url` column exists (text, nullable)
- ✓ `thumbnail_width` column exists (integer, default 400)
- ✓ `thumbnail_height` column exists (integer, nullable)

### Test 2: Column Constraints
- ✓ `thumbnail_url` has length constraint (max 1000 chars)
- ✓ Both storage and thumbnail URLs have proper CHECK constraints

### Test 3: Database Index
- ✓ `idx_assets_thumbnail_url` index exists
- ✓ Index uses partial WHERE clause (only non-NULL thumbnails)

### Test 4: Backward Compatibility
- ✓ Existing queries work without modification
- ✓ Old assets display correctly (thumbnail_url = NULL)
- ✓ No breaking changes to existing code

### Test 5: New Queries
- ✓ Can query thumbnail fields
- ✓ NULL thumbnails handled gracefully
- ✓ Default values applied correctly

### Test 6: INSERT with Thumbnails
- ✓ Can insert assets with thumbnail data
- ✓ All thumbnail fields persist correctly

### Test 7: INSERT without Thumbnails
- ✓ Can insert assets without thumbnail data (old behavior)
- ✓ thumbnail_url remains NULL
- ✓ thumbnail_width gets default value (400)

### Test 8: Documentation
- ✓ Column comments explain purpose
- ✓ Critical PDF warning documented

## Troubleshooting

### Error: "column does not exist"

**Cause:** Schema migration hasn't been applied yet.

**Solution:** Run the migration script (Step 1 above).

### Error: "permission denied"

**Cause:** Insufficient database permissions.

**Solution:** 
- Use Service Role Key (not Anon Key) for tests
- Or run SQL tests directly in Supabase Dashboard (automatic admin access)

### Error: "foreign key violation" during INSERT test

**Cause:** Test user_id doesn't exist in profiles table.

**Solution:** This is expected and the test handles it gracefully. The important part is that the schema accepts the thumbnail fields.

### All columns show NULL

**Cause:** This is normal! Existing assets don't have thumbnails yet.

**Solution:** This is expected behavior (backward compatibility). Thumbnails will be generated when Phase 2 is implemented.

## Success Criteria

Phase 1 is complete when ALL of the following are true:

- [ ] ✅ All three thumbnail columns exist in `assets` table
- [ ] ✅ Index `idx_assets_thumbnail_url` exists
- [ ] ✅ Can SELECT thumbnail fields without errors
- [ ] ✅ Can INSERT with thumbnail values
- [ ] ✅ Can INSERT without thumbnail values (backward compatible)
- [ ] ✅ Existing assets have NULL thumbnails (no data loss)
- [ ] ✅ storage_url field unchanged (no breaking changes)
- [ ] ✅ Column comments document usage

## Next Steps After Phase 1

Once all tests pass:

1. ✅ **Phase 1 Complete** - Database schema ready
2. 🔜 **Phase 2** - Implement thumbnail generation API
   - Create `/api/images/generate-thumbnail.post.js`
   - Integrate Sharp for image processing
   - Update `uploadAsset` composable
3. 🔜 **Phase 3** - Update UI to use thumbnails
4. 🔜 **Phase 4** - Verify PDF generation safety
5. 🔜 **Phase 5** - Backfill thumbnails for existing assets

See `docs/thumbnail-architecture.md` for detailed implementation plan.

## Files in This Test Suite

- `thumbnail-schema-test.sql` - SQL-based tests (run in Supabase Dashboard)
- `thumbnail-schema-test.js` - Node.js automated tests (run via command line)
- `README-THUMBNAIL-TESTS.md` - This file (instructions)

## Questions?

- 📚 Architecture: See `docs/thumbnail-architecture.md`
- 🗺️ System Flow: See `docs/architecture.mermaid`
- 📋 Technical Specs: See `docs/technical.md`
- 🐛 Issues: Check troubleshooting section above

---

**Last Updated:** 2025-10-21
**Phase:** 1 - Database Foundation
**Status:** Ready for Testing

