#!/bin/bash

echo "🔧 Fixing Supabase import issues (clean only, no reinstall)..."

# Clear Supabase-specific caches
echo "🔐 Clearing Supabase caches..."
rm -rf .nuxt/supabase 2>/dev/null || true
rm -rf .nuxt/types/supabase.d.ts 2>/dev/null || true
rm -rf node_modules/@nuxtjs/supabase/dist 2>/dev/null || true

# Clear Nuxt imports that might be corrupted
echo "📦 Clearing corrupted imports..."
rm -rf .nuxt/imports 2>/dev/null || true
rm -f .nuxt/imports.d.ts 2>/dev/null || true
rm -f .nuxt/types/imports.d.ts 2>/dev/null || true

# Regenerate Nuxt types
echo "🔄 Regenerating Nuxt types..."
npx nuxi prepare 2>/dev/null || true

# Clear npm cache
echo "📦 Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

echo "✅ Supabase import clean completed!"
echo ""
echo "💡 If you get a module not found error, run: npm install" 