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

# Kill any remaining Node processes related to development
echo "🔪 Killing Node development processes..."
pkill -f "nuxt\|vite\|node.*dev" 2>/dev/null || true

# Kill any processes using the development ports
echo "🚪 Clearing development ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Kill any processes that might be holding onto module files
echo "🔪 Killing any remaining Node processes..."
pkill -f "node.*supabase" 2>/dev/null || true
pkill -f "node.*@nuxtjs" 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

echo "✅ Comprehensive cleanup completed!" 