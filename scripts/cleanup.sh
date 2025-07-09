#!/bin/bash

echo "🧹 Starting comprehensive cleanup process..."

# Remove Nuxt and Vite cache directories
echo "📁 Removing Nuxt cache directories..."
rm -rf .nuxt node_modules/.vite 2>/dev/null || true

# Clear Nuxt imports cache (this is where the useSupabaseSession error comes from)
echo "📦 Clearing Nuxt imports cache..."
rm -rf .nuxt/imports 2>/dev/null || true

# Clear any Supabase module cache
echo "🔐 Clearing Supabase module cache..."
rm -rf .nuxt/supabase 2>/dev/null || true

# Clear Node.js module cache
echo "🗂️ Clearing Node.js module cache..."
rm -rf node_modules/.cache 2>/dev/null || true

# Additional comprehensive cleanup
echo "🧹 Additional comprehensive cleanup..."
rm -rf .nuxt node_modules/.vite node_modules/.cache

# Improved: Loop to kill lingering dev processes up to 5 times
for i in {1..5}; do
  echo "🔪 Pass $i: Killing lingering Node/Nuxt/Vite/Supabase processes..."
  pkill -f "nuxt\|vite\|node.*dev" 2>/dev/null || true
  pkill -f "node.*supabase" 2>/dev/null || true
  pkill -f "node.*@nuxtjs" 2>/dev/null || true
  pkill -f "vite:client-inject" 2>/dev/null || true
  # Kill any process using .nuxt, node_modules, or supabase files
  lsof +D .nuxt 2>/dev/null | awk 'NR>1 {print $2}' | xargs -r kill -9 2>/dev/null || true
  lsof +D node_modules 2>/dev/null | awk 'NR>1 {print $2}' | xargs -r kill -9 2>/dev/null || true
  lsof +D .nuxt/supabase 2>/dev/null | awk 'NR>1 {print $2}' | xargs -r kill -9 2>/dev/null || true
  sleep 1
  # Check if any remain
  REMAIN=$(pgrep -f "nuxt\|vite\|node.*dev\|node.*supabase\|node.*@nuxtjs\|vite:client-inject" | wc -l)
  if [ "$REMAIN" -eq 0 ]; then
    break
  fi
done

if [ "$REMAIN" -ne 0 ]; then
  echo "⚠️  Warning: Some dev processes may still be running. Consider rebooting your shell or system."
fi

# Kill any processes using the development ports
echo "🚪 Clearing development ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

echo "✅ Comprehensive cleanup completed!" 