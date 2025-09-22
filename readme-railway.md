# Railway Debugging Guide for Photo Replacement

This guide explains how to use the Railway debugging script to diagnose photo replacement hangs in production.

## 🚂 Overview

The `scripts/railway-monitor.sh` script helps you monitor and debug photo replacement issues on Railway.com. It provides real-time log monitoring, debug endpoint testing, and deployment assistance.

## ⚠️ Important Railway Configuration Notes

**Critical Requirements for Railway Deployment:**

1. **Start Command**: 
   - ❌ **DO NOT use `npm run dev`** as the start command on Railway
   - ✅ **MUST use `npm start`** for both development and production deployment

2. **Build Command Requirements**:
   - ✅ **MUST include ImageMagick and GraphicsMagick** in build command
   - ✅ **Required for smartcrop-gm functionality** (intelligent photo cropping)
   - ✅ **Required for image processing** (resizing, format conversion)

**Correct Build Command:**
```bash
apt-get update && apt-get install -y poppler-utils graphicsmagick imagemagick && npm run build
```

**Why These Dependencies Are Required:**
- **`poppler-utils`**: PDF to JPG conversion for memory books
- **`graphicsmagick`**: Image processing and manipulation
- **`imagemagick`**: Required by smartcrop-gm for intelligent cropping

## 📋 Prerequisites

- Railway CLI installed (`npm install -g @railway/cli`)
- Access to your Railway project
- Authentication token for API testing (optional)

## 🚀 Quick Start

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Connect to Your Project
```bash
railway link
```

### 4. Run the Monitoring Script
```bash
./scripts/railway-monitor.sh
```

## 🔧 Development Mode Deployment

### **Why Deploy in Development Mode?**

When debugging issues that work locally but fail in production, deploying in development mode can help identify the root cause:

- **Better error messages** and stack traces
- **Source maps** for exact line numbers
- **Less aggressive optimizations** that might hide issues
- **More detailed console logs** for debugging
- **Vue DevTools** work better in development mode

### **Using the Development Deploy Script**

```bash
# Deploy in development mode to Railway
./railway-dev-deploy.sh
```

This script will:
1. ✅ Create a temporary development `package.json`
2. ✅ Set Railway environment variables for development
3. ✅ Deploy to Railway in development mode
4. ✅ Restore your original `package.json`

### **Manual Development Mode Deployment**

If you prefer to set it up manually:

```bash
# Set development environment variables
railway variables set NODE_ENV=development
railway variables set NUXT_DEV=true
railway variables set NUXT_DEBUG=true

# Deploy
railway up
```

### **Using railway.toml for Development**

The `railway.toml` file automatically configures development mode:

```toml
[build]
builder = "nixpacks"
buildCommand = "apt-get update && apt-get install -y poppler-utils graphicsmagick imagemagick && npm run build"
startCommand = "npm start"

[env]
NODE_ENV = "development"
NUXT_DEV = "true"
NUXT_DEBUG = "true"
```

**Important Notes:**
- ❌ **DO NOT use `npm run dev`** as the start command on Railway
- ✅ **MUST use `npm start`** for both development and production deployment
- ✅ **MUST include ImageMagick and GraphicsMagick** in build command for image processing

### **When to Use Development Mode**

Use development mode deployment when:
- 🔍 **Issues work locally** but fail in production
- 🐛 **Need better error messages** for debugging
- 🔧 **Testing fixes** before production deployment
- 📊 **Comparing behavior** between dev and production
- 🎯 **Isolating build-related** vs environment-related issues

## 🔧 Script Features

### **Option 1: Monitor Photo Replacement Logs (Real-time)**
- Monitors Railway logs in real-time
- Filters for photo replacement debug messages
- Shows timestamps and relevant log entries
- Press Ctrl+C to stop

### **Option 2: Show Recent Activity**
- Displays last 50 lines of relevant logs
- Shows recent photo replacement activity
- Helps identify patterns in the logs

### **Option 3: Test Debug Endpoint**
- Tests the isolated photo replacement functionality
- Helps identify where the hang occurs
- Requires memory book ID and user ID

### **Option 4: Deploy Updated Code**
- Commits and deploys the enhanced debugging code
- Ensures latest changes are on Railway
- Automatically handles git operations

## 🔑 Getting an Auth Token

### Method 1: From Browser Developer Tools
1. Open your browser and go to your Railway app
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Perform any action that makes an API call
5. Look for requests to your API endpoints
6. In the request headers, find the `Authorization` header
7. Copy the token value (without "Bearer ")

### Method 2: From Application Code
1. Check your frontend code for where auth tokens are stored
2. Look for localStorage, sessionStorage, or cookies
3. Common locations:
   - `localStorage.getItem('auth_token')`
   - `localStorage.getItem('access_token')`
   - `sessionStorage.getItem('token')`

### Method 3: From Railway Environment Variables
1. Go to your Railway project dashboard
2. Navigate to your service
3. Go to the Variables tab
4. Look for auth-related environment variables
5. Use the token value directly

### Method 4: Generate a Test Token
If you have access to your database:
```sql
-- Check for existing tokens in your auth table
SELECT * FROM auth_tokens WHERE user_id = 'your-user-id';
```

## 📊 Understanding the Debug Messages

The enhanced logging provides these debug messages:

### **🔄 Photo Replacement Flow**
- `🔄 Photo replacement detected, replacing X photos`
- `🔄 DEBUG - photosToReplace: [...]`
- `🔄 DEBUG - Environment: production`
- `🔄 DEBUG - Timestamp: 2024-01-01T12:00:00.000Z`

### **🎯 Photo Selection Process**
- `🎯 Selecting X photos from Y available assets`
- `🎯 DEBUG - Environment: production`
- `🎯 DEBUG - Starting photo selection at: 2024-01-01T12:00:00.000Z`
- `🎯 DEBUG - About to make OpenAI request at: 2024-01-01T12:00:00.000Z`
- `🎯 DEBUG - Payload size: XXXX characters`

### **🔗 OpenAI API Calls**
- `🔗 DEBUG - Making OpenAI API request at: 2024-01-01T12:00:00.000Z`
- `🔗 DEBUG - Request URL: https://api.openai.com/v1/responses`
- `🔗 DEBUG - Payload size: XXXX characters`
- `🔗 DEBUG - OpenAI API response received at: 2024-01-01T12:00:00.000Z`
- `🔗 DEBUG - Response status: 200`

### **⏰ Timeout Detection**
- `⏰ DEBUG - Request timeout triggered at: 2024-01-01T12:05:00.000Z`

## 🔍 Troubleshooting Common Issues

### **Issue: "Railway CLI not found"**
```bash
npm install -g @railway/cli
```

### **Issue: "Not logged in to Railway"**
```bash
railway login
```

### **Issue: "Could not get Railway URL"**
```bash
railway link
railway domain
```

### **Issue: "Debug endpoint test failed"**
- Check if the endpoint is deployed
- Verify the memory book ID and user ID
- Check if auth token is valid
- Look for CORS issues in browser console

### **Issue: "No logs found"**
- Ensure the enhanced logging code is deployed
- Check if the photo replacement process is actually running
- Verify the log filtering patterns

## 📝 Manual Commands

If the script doesn't work, you can run these commands manually:

### **Monitor Logs**
```bash
# Railway CLI doesn't support --follow, so use a loop
while true; do
    railway logs --lines 20 | grep -E "(🔄|🎯|🔗|DEBUG|Photo replacement)"
    sleep 2
done
```

### **Show Recent Logs**
```bash
railway logs --lines 50 | grep -E "(🔄|🎯|🔗|DEBUG|Photo replacement)"
```

### **Deploy Code**
```bash
git add .
git commit -m "Add photo replacement debugging"
git push
railway up
```

### **Test Debug Endpoint**
```bash
curl -X POST "https://YOUR_RAILWAY_URL/api/debug/photo-replacement-test" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"memoryBookId":"YOUR_BOOK_ID","userId":"YOUR_USER_ID","testType":"full"}'
```

## 🎯 What to Look For

### **Successful Flow**
1. `🔄 Photo replacement detected, replacing X photos`
2. `🎯 Selecting X photos from Y available assets`
3. `🔗 DEBUG - Making OpenAI API request`
4. `🔗 DEBUG - OpenAI API response received`
5. `🎯 DEBUG - Response parsed at: ...`

### **Hang Indicators**
- Process stops after `🔗 DEBUG - Making OpenAI API request`
- No `🔗 DEBUG - OpenAI API response received` message
- `⏰ DEBUG - Request timeout triggered` after 5 minutes
- Error messages about network timeouts

### **Common Failure Points**
1. **Before OpenAI API call**: Database or asset fetching issues
2. **During OpenAI API call**: Network, rate limiting, or API issues
3. **After API call**: Response parsing or processing issues

## 🚨 Emergency Debugging

If the script doesn't work, try these emergency steps:

### **1. Check Railway Status**
```bash
railway status
```

### **2. View All Logs**
```bash
railway logs --lines 100
```

### **3. Check Environment Variables**
```bash
railway variables
```

### **4. Restart Service**
```bash
railway redeploy
```

### **5. Check Railway Dashboard**
- Go to [railway.app](https://railway.app)
- Navigate to your project
- Check the Logs tab
- Look for error messages

## 🔧 Development Mode Debugging

### **When Issues Work Locally But Fail in Production**

If your photo replacement works locally but fails on Railway:

#### **Step 1: Deploy in Development Mode**
```bash
# Use the development deploy script
./railway-dev-deploy.sh

# Or manually set development variables
railway variables set NODE_ENV=development
railway variables set NUXT_DEV=true
railway variables set NUXT_DEBUG=true
railway up
```

#### **Step 2: Test in Development Mode**
- Open your Railway app in development mode
- Test the photo replacement functionality
- Check browser console for better error messages
- Compare behavior with local development

#### **Step 3: Analyze the Differences**
- **If it works in dev mode**: Build optimization issue
- **If it still fails**: Environment or network issue
- **Check logs**: Development mode provides better error details

#### **Step 4: Gradual Production Deployment**
```bash
# Remove development variables
railway variables unset NODE_ENV
railway variables unset NUXT_DEV
railway variables unset NUXT_DEBUG

# Deploy production version
railway up
```

### **Development Mode Benefits for Debugging**
- ✅ **Better error messages** with exact line numbers
- ✅ **Source maps** for debugging minified code
- ✅ **Vue DevTools** work properly
- ✅ **Hot reloading** for quick testing
- ✅ **Less aggressive optimizations** that might hide issues

## 📞 Getting Help

If you're still having issues:

1. **Check Railway Documentation**: [docs.railway.app](https://docs.railway.app)
2. **Railway Support**: [railway.app/support](https://railway.app/support)
3. **Check Logs**: Look for error messages in Railway logs
4. **Test Locally**: Ensure the code works in local development
5. **Check Dependencies**: Verify all required packages are installed

## 🔄 Next Steps

After identifying the issue:

1. **Note the exact failure point** from the debug messages
2. **Check the timestamps** to see how long each step takes
3. **Look for error messages** in the logs
4. **Test the debug endpoint** to isolate the issue
5. **Apply the appropriate fix** based on the findings

## 📋 Checklist

- [ ] Railway CLI installed and logged in
- [ ] Project linked to Railway
- [ ] Enhanced debugging code deployed
- [ ] Auth token obtained (if testing debug endpoint)
- [ ] Memory book ID and user ID available
- [ ] Monitoring script running
- [ ] Debug messages appearing in logs
- [ ] Issue identified and documented

## 🔧 Development Mode Checklist

### **For Issues That Work Locally But Fail in Production:**

- [ ] **Development deploy script ready** (`./railway-dev-deploy.sh`)
- [ ] **Development mode deployed** to Railway
- [ ] **Environment variables set** (NODE_ENV=development, NUXT_DEV=true, NUXT_DEBUG=true)
- [ ] **Tested in development mode** on Railway
- [ ] **Compared behavior** with local development
- [ ] **Analyzed differences** between dev and production
- [ ] **Identified root cause** (build vs environment issue)
- [ ] **Applied appropriate fix** based on findings
- [ ] **Deployed production version** after testing
