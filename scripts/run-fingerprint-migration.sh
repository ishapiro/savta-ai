#!/bin/bash

# Script to run the asset fingerprint migration and update existing assets
# This script will:
# 1. Run the database migration to add the fingerprint column
# 2. Update existing assets with fingerprints

set -e  # Exit on any error

echo "🔍 Starting asset fingerprint migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL to your Supabase database connection string"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "📊 Running database migration..."

# Run the migration
psql "$DATABASE_URL" -f supabase/migration_add_asset_fingerprint_v2.sql

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully"
else
    echo "❌ Database migration failed"
    exit 1
fi

echo "🔧 Updating existing assets with fingerprints..."

# Run the fingerprint update script
node scripts/update-asset-fingerprints.js

if [ $? -eq 0 ]; then
    echo "✅ Asset fingerprint update completed successfully"
else
    echo "❌ Asset fingerprint update failed"
    exit 1
fi

echo "🎉 Migration and update completed successfully!"
echo "📊 Summary:"
echo "  - Added fingerprint column to assets table"
echo "  - Created index for efficient fingerprint lookups"
echo "  - Updated existing assets with unique fingerprints"
echo ""
echo "🚀 The AI will now use fingerprints to avoid duplicate photos in memory cards!" 