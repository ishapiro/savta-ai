#!/bin/bash

echo "🔄 Starting comprehensive reset process..."

# Run the cleanup script first
echo "🧹 Running cleanup..."
bash scripts/cleanup.sh

# Clear node_modules and reinstall
echo "📦 Clearing node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
npm install

# Fix Supabase imports
echo "🔧 Fixing Supabase imports..."
bash scripts/fix-supabase-safe.sh

# Regenerate Nuxt types
echo "🔄 Regenerating Nuxt types..."
npx nuxi prepare

echo "✅ Comprehensive reset completed!"
echo ""
echo "💡 You can now run 'npm run dev' to start the development server"
echo "" 