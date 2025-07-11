#!/bin/bash

echo "🧹 Starting comprehensive cleanup process..."

# Function to check if a directory exists and remove it safely
safe_remove() {
    local dir="$1"
    local description="$2"
    if [ -d "$dir" ]; then
        echo "📁 Removing $description: $dir"
        rm -rf "$dir" 2>/dev/null || true
    else
        echo "ℹ️  $description not found: $dir"
    fi
}

# Function to kill processes safely
safe_kill() {
    local pattern="$1"
    local description="$2"
    echo "🔪 Killing $description processes..."
    pkill -f "$pattern" 2>/dev/null || true
}

# Remove Nuxt and Vite cache directories
echo "📁 Removing Nuxt cache directories..."
safe_remove ".nuxt" "Nuxt cache directory"
safe_remove "node_modules/.vite" "Vite cache directory"
safe_remove ".output" "Nuxt output directory"

# Clear Nuxt imports cache (this is where the useSupabaseSession error comes from)
echo "📦 Clearing Nuxt imports cache..."
safe_remove ".nuxt/imports" "Nuxt imports cache"
safe_remove ".nuxt/nitro" "Nitro cache"
safe_remove ".nuxt/vite" "Vite cache"
safe_remove ".nuxt/dist" "Nuxt dist cache"

# Clear any Supabase module cache
echo "🔐 Clearing Supabase module cache..."
safe_remove ".nuxt/supabase" "Supabase module cache"
safe_remove "node_modules/@nuxtjs/supabase" "Supabase package cache"

# Clear Node.js module cache
echo "🗂️ Clearing Node.js module cache..."
safe_remove "node_modules/.cache" "Node.js cache"
safe_remove ".cache" "Global cache"

# Clear TypeScript cache
echo "📝 Clearing TypeScript cache..."
safe_remove ".nuxt/types" "Nuxt types cache"
safe_remove "node_modules/.cache/typescript" "TypeScript cache"

# Clear ESLint cache
echo "🔍 Clearing ESLint cache..."
safe_remove ".eslintcache" "ESLint cache"

# Clear any lock files that might be causing issues
echo "🔒 Clearing lock files..."
rm -f .nuxt/imports.d.ts 2>/dev/null || true
rm -f .nuxt/types/imports.d.ts 2>/dev/null || true
rm -f .nuxt/types/supabase.d.ts 2>/dev/null || true

# Kill all development processes
echo "🔪 Killing all development processes..."
safe_kill "nuxt" "Nuxt"
safe_kill "vite" "Vite"
safe_kill "node.*dev" "Node dev"
safe_kill "node.*supabase" "Supabase"
safe_kill "node.*@nuxtjs" "NuxtJS"
safe_kill "vite:client-inject" "Vite client inject"

# Improved: Loop to kill lingering dev processes up to 5 times
for i in {1..5}; do
  echo "🔪 Pass $i: Killing lingering processes..."
  
  # Kill processes using specific directories
  lsof +D .nuxt 2>/dev/null | awk 'NR>1 {print $2}' | xargs -r kill -9 2>/dev/null || true
  lsof +D node_modules 2>/dev/null | awk 'NR>1 {print $2}' | xargs -r kill -9 2>/dev/null || true
  lsof +D .nuxt/supabase 2>/dev/null | awk 'NR>1 {print $2}' | xargs -r kill -9 2>/dev/null || true
  
  # Kill processes by pattern
  pkill -f "nuxt\|vite\|node.*dev\|node.*supabase\|node.*@nuxtjs\|vite:client-inject" 2>/dev/null || true
  
  sleep 1
  
  # Check if any remain
  REMAIN=$(pgrep -f "nuxt\|vite\|node.*dev\|node.*supabase\|node.*@nuxtjs\|vite:client-inject" | wc -l)
  if [ "$REMAIN" -eq 0 ]; then
    echo "✅ All processes terminated successfully"
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
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Clear npm cache if needed
echo "📦 Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Regenerate Nuxt types (this helps with import issues)
echo "🔄 Regenerating Nuxt types..."
npx nuxi prepare 2>/dev/null || true

# Clear any remaining temporary files
echo "🗑️ Clearing temporary files..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Install dependencies to ensure everything is properly set up
echo "📦 Installing dependencies..."
npm install

echo "✅ Comprehensive cleanup completed!"

# Provide helpful next steps
echo ""
echo "💡 Next steps:"
echo "  1. Run 'npm run dev' to start development server"
echo "  2. If you still get import errors, try 'npm run dev:reset'"
echo "  3. For persistent issues, try 'rm -rf node_modules && npm install'"
echo "" 