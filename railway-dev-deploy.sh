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

# Create a temporary package.json for dev deployment
echo "📝 Creating development package.json..."
cp package.json package.json.backup

# Modify package.json to use dev mode
cat > package.json << 'EOF'
{
  "name": "savta-ai",
  "private": true,
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "devDependencies": {
    "@nuxt/devtools": "latest",
    "nuxt": "^3.8.0"
  },
  "dependencies": {
    "@nuxtjs/supabase": "^0.5.0",
    "@pinia/nuxt": "^0.5.1",
    "@primevue/nuxt": "^0.0.1",
    "@primevue/volt": "^0.0.1",
    "@primevue/themes": "^0.0.1",
    "nuxt": "^3.8.0",
    "pinia": "^2.1.7",
    "primeicons": "^7.0.0",
    "primevue": "^3.50.0",
    "vue": "^3.4.0",
    "vue-router": "^4.2.5"
  }
}
EOF

echo "✅ Development package.json created"

# Set Railway environment variables for development
echo "🔧 Setting Railway environment variables..."
railway variables set NODE_ENV=development
railway variables set NUXT_DEV=true
railway variables set NUXT_DEBUG=true

echo "✅ Environment variables set"

# Deploy to Railway
echo "🚀 Deploying to Railway in development mode..."
railway up

echo "✅ Development deployment completed!"

# Restore original package.json
echo "🔄 Restoring original package.json..."
mv package.json.backup package.json

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
