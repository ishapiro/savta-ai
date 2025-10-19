#!/bin/bash

# force-restart-dev.sh - Aggressively stop ALL node/npm processes and restart dev
# Usage: ./force-restart-dev.sh
# WARNING: This will kill ALL node processes on your system

echo "⚠️  FORCE RESTART - This will kill ALL node processes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Kill ALL node processes
echo "🛑 Killing ALL node processes..."
pkill -9 node 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ All node processes killed"
else
  echo "ℹ️  No node processes found"
fi

# Kill all npm processes
echo "🛑 Killing ALL npm processes..."
pkill -9 npm 2>/dev/null

# Kill all processes listening on ANY port (for node/npm)
echo "🔍 Finding and killing all node-related port listeners..."
lsof -ti -sTCP:LISTEN | while read pid; do
  process=$(ps -p $pid -o comm= 2>/dev/null)
  if [[ "$process" == *"node"* ]] || [[ "$process" == *"npm"* ]]; then
    echo "   🔫 Killing $process (PID: $pid)"
    kill -9 $pid 2>/dev/null
  fi
done

echo "⏳ Waiting 3 seconds for cleanup..."
sleep 3

# Clean up caches and lock files
echo "🧹 Cleaning up caches and lock files..."
rm -rf .nuxt/.lock 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -rf .output 2>/dev/null

# Check if ports are clear
echo "✅ Port cleanup complete"
echo ""
echo "🚀 Starting fresh npm run dev..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start npm run dev
npm run dev

