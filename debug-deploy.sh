#!/bin/bash

# Deploy Savta.ai with debug logging enabled to Railway for debugging production issues
# This keeps production build but enables debug console logs

echo "🔍 Deploying Savta.ai with Debug Logging to Railway"
echo "================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the project root directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI ready"

echo "📝 Setting up Railway debug configuration..."
cp railway-debug.toml railway.toml
echo "✅ Debug configuration applied"

# Set Railway environment variables for debug mode
echo "🔧 Setting Railway environment variables for debug..."
railway variables --set NODE_ENV=production
railway variables --set NUXT_DEBUG=true

echo "✅ Environment variables set"

# Deploy to Railway
echo "🚀 Deploying to Railway with debug logging..."
railway up

echo "✅ Debug deployment completed!"

echo "📋 Debug Deployment Summary:"
echo "=========================="
echo "✅ Deployed in production mode with debug logging"
echo "✅ NODE_ENV=production"
echo "✅ NUXT_DEBUG=true"
echo ""
echo "🔍 Now you can test the photo replacement issue and see detailed logs"
echo "🌐 Check your Railway dashboard for the deployment URL"
echo "📊 Open browser console before clicking photos to capture debug logs"
echo ""
echo "⚠️  Remember to revert to production mode after debugging:"
echo "   cp railway-production.toml railway.toml && railway up"
