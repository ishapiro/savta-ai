# Backfill Script: AWS Rekognition Collections

## Overview

The backfill script reindexes all existing assets with the new AWS Rekognition Collections system. This is a one-time migration operation to populate face data for photos that were uploaded before the Rekognition Collections system was implemented.

## What the Script Does

1. **Fetches all users** (or a specific user if specified)
2. **Fetches all image assets** for each user (only approved, non-deleted images)
3. **For each asset:**
   - Calls the `/api/ai/index-face-rekognition` endpoint
   - Creates a Rekognition collection for the user (if doesn't exist)
   - Indexes faces using AWS `IndexFaces` API
   - Searches for matches using AWS `SearchFaces` API
   - Auto-assigns faces with ≥95% similarity
   - Flags faces with 80-94% similarity for user review
   - Marks new faces (<80% similarity) for user assignment
4. **Tracks progress** and displays statistics
5. **Estimates AWS costs** based on API usage

## Usage

### Method 1: Interactive Helper Script (Recommended)

```bash
./scripts/run-rekognition-backfill.sh
```

This provides a menu with options:
1. Dry run (show what would be processed)
2. Process ALL users and assets
3. Process specific user
4. Test run (limit 10 assets per user)
5. Cancel

### Method 2: Direct Node Script

```bash
# Process all users
node scripts/backfill-rekognition-collections.js

# Dry run (no changes made)
node scripts/backfill-rekognition-collections.js --dry-run

# Process specific user
node scripts/backfill-rekognition-collections.js --user-id=<uuid>

# Limit assets (for testing)
node scripts/backfill-rekognition-collections.js --limit=10

# Skip confirmation prompt
node scripts/backfill-rekognition-collections.js --skip-prompt

# Custom batch size
node scripts/backfill-rekognition-collections.js --batch-size=20

# Combine options
node scripts/backfill-rekognition-collections.js --user-id=<uuid> --limit=5 --dry-run
```

## Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--user-id=<uuid>` | Process only specific user | All users |
| `--dry-run` | Show what would be processed without making changes | false |
| `--limit=<number>` | Limit number of assets to process per user | Unlimited |
| `--skip-prompt` | Skip confirmation prompt | false |
| `--batch-size=<n>` | Process assets in batches of N | 10 |

## Prerequisites

### Environment Variables

Required in `.env` file:

```bash
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NUXT_PUBLIC_SITE_URL=https://savta.ai  # or http://localhost:3000 for local

# AWS credentials (required by Rekognition)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### AWS Permissions

The AWS credentials must have permissions for:
- `rekognition:CreateCollection`
- `rekognition:DescribeCollection`
- `rekognition:IndexFaces`
- `rekognition:SearchFaces`

### Application State

The application must be running (or at least the API endpoints must be accessible):

```bash
# For local development
npm run dev

# For production
npm start
```

**Note:** The script calls the API endpoints, so the server must be running.

## Output

### Progress Display

```
[████████████████████████████░░░░░░░░░░░░░░░░░░░░] 56% | 112/200 assets | ✅ 110 | ❌ 2 | 👥 234 faces
```

- **Progress bar**: Visual indication of completion
- **Percentage**: Completion percentage
- **Assets processed**: Current/Total
- **✅ Successful**: Assets successfully processed
- **❌ Failed**: Assets that encountered errors
- **👥 Faces**: Total faces detected across all assets

### Summary Report

```
================================================================================
📊 BACKFILL SUMMARY
================================================================================

👥 Users processed:           5
📸 Total assets:              200
✅ Successfully processed:    198
❌ Failed:                    2
⏭️  Skipped (dry run):        0

🎭 Faces detected:            456
🤖 Faces auto-assigned:       312
👤 Faces needing user input:  144

💰 ESTIMATED AWS COSTS:
────────────────────────────────────────────────────────────────────────────────
IndexFaces calls:   198 × $0.001 = $0.20
SearchFaces calls:  456 × $0.001 = $0.46
Total estimated:    $0.66

================================================================================
✅ BACKFILL COMPLETED

⚠️  144 faces need user assignment.
   Users should visit the Person Manager page to assign these faces.
```

### Error Details

If errors occur, they are displayed at the end:

```
❌ ERRORS:
────────────────────────────────────────────────────────────────────────────────
1. Asset: IMG_1234.jpg (a1b2c3d4-...)
   User: user@example.com
   Error: Network timeout

2. Asset: IMG_5678.jpg (e5f6g7h8-...)
   User: another@example.com
   Error: Invalid image format
```

## Cost Estimation

### AWS Rekognition Pricing (as of 2024)

- **IndexFaces**: $0.001 per image
- **SearchFaces**: $0.001 per search

### Example Scenarios

**Small User (50 photos, 2 faces avg):**
- IndexFaces: 50 × $0.001 = $0.05
- SearchFaces: 100 × $0.001 = $0.10
- **Total: $0.15**

**Medium User (500 photos, 2 faces avg):**
- IndexFaces: 500 × $0.001 = $0.50
- SearchFaces: 1000 × $0.001 = $1.00
- **Total: $1.50**

**Large User (2000 photos, 2 faces avg):**
- IndexFaces: 2000 × $0.001 = $2.00
- SearchFaces: 4000 × $0.001 = $4.00
- **Total: $6.00**

### Total Platform Cost

If you have 100 users with an average of 200 photos each:
- 100 users × 200 photos × $0.003 per photo = **$60.00**

This is a **one-time cost** for the migration. New photos only incur costs at upload time.

## Best Practices

### 1. Test First

Always run a test before processing all data:

```bash
# Dry run to see what would happen
node scripts/backfill-rekognition-collections.js --dry-run

# Test with limited assets
node scripts/backfill-rekognition-collections.js --limit=10

# Test with a single user
node scripts/backfill-rekognition-collections.js --user-id=<uuid> --limit=5
```

### 2. Run During Off-Peak Hours

The backfill process:
- Makes many AWS API calls
- Can take several hours for large datasets
- May impact application performance

**Recommendation:** Run during low-traffic hours (e.g., 2-6 AM).

### 3. Monitor Progress

The script displays real-time progress. You can:
- Watch the progress bar
- Monitor error count
- Press Ctrl+C to gracefully stop (shows partial summary)

### 4. Handle Failures

If the script fails or is interrupted:
- Note the last processed asset from the logs
- The script is idempotent (safe to re-run)
- Already-processed faces will be skipped or updated
- Re-run the script to continue

### 5. Verify Results

After backfill:

1. **Check database:**
   ```sql
   -- Count faces indexed
   SELECT COUNT(*) FROM faces WHERE deleted = false;
   
   -- Count auto-assigned faces
   SELECT COUNT(*) FROM face_person_links WHERE assigned_by = 'system';
   
   -- Count faces needing assignment
   SELECT COUNT(*) FROM faces WHERE needs_assignment = true AND deleted = false;
   ```

2. **Check Rekognition collections:**
   ```bash
   aws rekognition list-collections --region us-east-1
   aws rekognition describe-collection --collection-id savta-user-<user-id>
   ```

3. **Test in UI:**
   - Visit Person Manager page
   - Check "Faces Awaiting Assignment" section
   - Verify face thumbnails display correctly
   - Test assigning a face to a person

## Troubleshooting

### Error: "No access token available"

**Cause:** Server not running or API endpoints not accessible.

**Solution:**
```bash
npm run dev  # or npm start for production
```

### Error: "ResourceNotFoundException: Collection not found"

**Cause:** Rekognition collection was deleted or never created.

**Solution:** The script automatically creates collections. If this persists, check AWS credentials.

### Error: "Rate exceeded"

**Cause:** Too many concurrent AWS API calls.

**Solution:** Reduce batch size:
```bash
node scripts/backfill-rekognition-collections.js --batch-size=5
```

### Error: "InvalidS3ObjectException"

**Cause:** Image URL not accessible or invalid format.

**Solution:** 
- Check that `storage_url` in assets table is correct
- Verify Supabase Storage URLs are public or have correct permissions
- Check image file is not corrupted

### Script Hangs or Freezes

**Cause:** Network issues or AWS timeout.

**Solution:**
- Press Ctrl+C to stop gracefully
- Check network connectivity
- Check AWS service status
- Re-run the script (it will skip already-processed assets)

## Post-Backfill Steps

### 1. Notify Users

After backfill, some faces will need user assignment. Notify users:

> "We've upgraded our face recognition system! Please visit the Person Manager page to review and assign faces we detected in your photos."

### 2. Monitor AWS Costs

Check AWS billing dashboard after 24-48 hours to verify actual costs match estimates.

### 3. Clean Up

Once verified, you can remove old migration files:

```bash
# See docs/OBSOLETE_FILES.md for list of files to remove
```

### 4. Update Documentation

Update any user-facing docs to reflect the new system.

## Advanced Usage

### Process Multiple Users in Parallel

**Not recommended** - Can exceed AWS rate limits and cause errors.

Instead, use the batch-size option and let the script handle parallelization:

```bash
node scripts/backfill-rekognition-collections.js --batch-size=20
```

### Resume from Specific User

If interrupted, you can process remaining users:

```bash
# Get list of users who still need processing
# Then process each individually
node scripts/backfill-rekognition-collections.js --user-id=<uuid>
```

### Custom Filtering

Edit the script's `getUserAssets()` function to add custom filters:

```javascript
// Example: Only process photos from last 30 days
.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
```

## Script Architecture

### Main Components

1. **`getUsers()`** - Fetches users from database
2. **`getUserAssets(userId)`** - Fetches image assets for a user
3. **`indexAsset(asset, userEmail)`** - Calls API to index faces
4. **`processUser(user)`** - Processes all assets for one user
5. **`displaySummary()`** - Shows final statistics

### Flow Diagram

```
Start
  ↓
Load .env variables
  ↓
Parse command-line options
  ↓
Fetch users from database
  ↓
Count total assets
  ↓
Display confirmation prompt
  ↓
For each user:
  ↓
  Fetch user's assets
  ↓
  Process in batches:
    ↓
    For each asset:
      ↓
      Call /api/ai/index-face-rekognition
      ↓
      Update statistics
    ↓
    Wait 1 second (rate limiting)
  ↓
Display summary
  ↓
Exit
```

## Related Documentation

- `docs/FACE_RECOGNITION_REKOGNITION_COLLECTIONS.md` - System architecture
- `docs/PDF_CROPPING_COMPATIBILITY_AUDIT.md` - Face cropping compatibility
- `docs/DATABASE_AUDIT.md` - Database schema details
- `aws-rekognition-collections.plan.md` - Original migration plan

## Support

If you encounter issues:

1. Check the error logs in the summary
2. Review troubleshooting section above
3. Verify prerequisites are met
4. Try a dry run first
5. Test with a single user and limited assets

For persistent issues, check:
- AWS CloudWatch logs for Rekognition API errors
- Supabase logs for database errors
- Application server logs for API endpoint errors

