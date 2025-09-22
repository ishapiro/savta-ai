#!/bin/bash

# Deploy Savta.ai in development mode to Railway for debugging
# This helps identify production vs development differences

echo "🚀 Deploying Savta.ai in Development Mode to Railway"
echo "=================================================="

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

echo "📝 Ensuring Railway dev configuration is present (railway.toml) ..."
if [ ! -f "railway.toml" ]; then
  cat > railway.toml << 'EOF'
# Railway configuration for development debugging
[build]
builder = "nixpacks"
buildCommand = "apt-get update && apt-get install -y poppler-utils graphicsmagick imagemagick && npm run build"
startCommand = "npm start"

[deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[env]
NODE_ENV = "development"
NUXT_DEV = "true"
NUXT_DEBUG = "true"
EOF
  echo "✅ Created default railway.toml for dev"
else
  echo "✅ Found existing railway.toml"
fi

# Set Railway environment variables for development
echo "🔧 Setting Railway environment variables..."
railway variables --set NODE_ENV=development
railway variables --set NUXT_DEV=true
railway variables --set NUXT_DEBUG=true

echo "✅ Environment variables set"

# Deploy to Railway
echo "🚀 Deploying to Railway in development mode..."
railway up

echo "✅ Development deployment completed!"

echo "📋 Development Deployment Summary:"
echo "=================================="
echo "✅ Deployed in development mode"
echo "✅ NODE_ENV=development"
echo "✅ NUXT_DEV=true"
echo "✅ NUXT_DEBUG=true"
echo ""
echo "🔍 Now you can test the photo replacement issue in development mode on Railway"
echo "🌐 Check your Railway dashboard for the deployment URL"
echo ""
echo "📊 Benefits of Development Mode on Railway:"
echo "- Better error messages"
echo "- Source maps for debugging"
echo "- Hot module replacement"
echo "- More detailed console logs"
echo "- Less aggressive optimizations"
