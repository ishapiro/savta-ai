#!/bin/bash

# restart-dev.sh - Stop all npm run dev processes and start fresh
# Usage: ./restart-dev.sh

echo "🛑 Stopping all npm run dev processes..."

# Kill all npm run dev processes
pkill -f "npm run dev" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ Killed npm run dev processes"
else
  echo "ℹ️  No npm run dev processes found"
fi

# Kill all node processes (includes nuxt, vite, etc.)
pkill -f "node.*dev" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ Killed node dev processes"
fi

# Kill processes on common dev ports (3000, 3001, 24678, etc.)
echo "🔍 Checking for processes on common dev ports..."

for port in 3000 3001 24678 8080 5173; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "   🔫 Killing process on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null
  fi
done

# Also check for any Nuxt/Vite dev servers
pkill -f "nuxt.*dev" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "⏳ Waiting 2 seconds for cleanup..."
sleep 2

# Clear any orphaned lock files
echo "🧹 Cleaning up lock files..."
rm -f .nuxt/.lock 2>/dev/null
rm -f node_modules/.cache 2>/dev/null

echo ""
echo "🚀 Starting fresh npm run dev..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start npm run dev
npm run dev

