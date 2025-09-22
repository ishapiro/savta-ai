#!/bin/bash

# Railway.com monitoring script for photo replacement debugging
# This script helps monitor Railway logs for the photo replacement issue

echo "🚂 Railway Photo Replacement Monitor"
echo "===================================="

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI not found. Installing..."
        npm install -g @railway/cli
        echo "✅ Railway CLI installed"
    else
        echo "✅ Railway CLI found"
    fi
}

# Check if user is logged in
check_railway_auth() {
    if ! railway whoami &> /dev/null; then
        echo "❌ Not logged in to Railway. Please run: railway login"
        return 1
    else
        echo "✅ Logged in to Railway"
        return 0
    fi
}

# Monitor Railway logs
monitor_railway_logs() {
    echo "🔍 Monitoring Railway logs for photo replacement..."
    echo "Press Ctrl+C to stop"
    echo ""
    echo "Note: Railway CLI doesn't support real-time following, so this will refresh every 2 seconds"
    echo ""
    
    # Railway CLI doesn't support --follow, so we'll use a loop with --lines
    while true; do
        echo "=== $(date) ==="
        railway logs --lines 20 | grep -E "(🔄|🎯|🔗|DEBUG|Photo replacement|selectPhotosByAttributes|makeOpenAIRequest|OpenAI|timeout|AbortError)" || echo "No matching logs found"
        echo ""
        sleep 2
    done
}

# Show recent Railway logs
show_recent_logs() {
    echo "📋 Recent Photo Replacement Activity:"
    echo "===================================="
    
    echo "Last 50 lines from Railway:"
    railway logs --lines 50 | grep -E "(🔄|🎯|🔗|DEBUG|Photo replacement)"
}

# Test the debug endpoint
test_debug_endpoint() {
    echo "🧪 Testing debug endpoint..."
    echo "============================"
    
    # Get the Railway URL
    echo "Getting Railway URL..."
    RAILWAY_URL=$(railway domain)
    if [ -z "$RAILWAY_URL" ]; then
        echo "❌ Could not get Railway URL. Please check your Railway project."
        return 1
    fi
    
    echo "Railway URL: $RAILWAY_URL"
    echo ""
    
    # Get authentication token
    read -p "Enter your auth token (or press Enter to skip): " AUTH_TOKEN
    
    # Get memory book ID
    read -p "Enter memory book ID to test: " MEMORY_BOOK_ID
    
    # Get user ID
    read -p "Enter user ID: " USER_ID
    
    echo ""
    echo "Testing debug endpoint at: https://$RAILWAY_URL/api/debug/photo-replacement-test"
    
    if [ -n "$AUTH_TOKEN" ]; then
        curl -X POST "https://$RAILWAY_URL/api/debug/photo-replacement-test" \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $AUTH_TOKEN" \
          -d "{\"memoryBookId\":\"$MEMORY_BOOK_ID\",\"userId\":\"$USER_ID\",\"testType\":\"full\"}"
    else
        curl -X POST "https://$RAILWAY_URL/api/debug/photo-replacement-test" \
          -H 'Content-Type: application/json' \
          -d "{\"memoryBookId\":\"$MEMORY_BOOK_ID\",\"userId\":\"$USER_ID\",\"testType\":\"full\"}"
    fi
    
    echo ""
    echo "✅ Debug endpoint test completed"
}

# Deploy the updated code
deploy_to_railway() {
    echo "🚀 Deploying updated code to Railway..."
    echo "======================================"
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        echo "❌ Not in a git repository. Please run this from your project root."
        return 1
    fi
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "📝 Committing changes..."
        git add .
        git commit -m "Add photo replacement debugging"
    fi
    
    # Push to Railway
    echo "🚀 Pushing to Railway..."
    railway up
    
    echo "✅ Deployment completed"
}

# Open Railway dashboard
open_railway_dashboard() {
    echo "🌐 Opening Railway dashboard..."
    echo "=============================="
    
    # Get the Railway URL
    RAILWAY_URL=$(railway domain)
    if [ -z "$RAILWAY_URL" ]; then
        echo "❌ Could not get Railway URL. Please check your Railway project."
        return 1
    fi
    
    echo "Railway URL: https://$RAILWAY_URL"
    echo "Dashboard: https://railway.app"
    echo ""
    echo "To monitor logs in the Railway dashboard:"
    echo "1. Go to https://railway.app"
    echo "2. Navigate to your project"
    echo "3. Click on your service"
    echo "4. Go to the 'Logs' tab"
    echo "5. Look for the debug messages we added"
    echo ""
    echo "Search for these patterns in the logs:"
    echo "- 🔄 (Photo replacement flow)"
    echo "- 🎯 (Photo selection process)"
    echo "- 🔗 (OpenAI API calls)"
    echo "- DEBUG (Debug messages)"
    echo "- Photo replacement"
    echo "- selectPhotosByAttributes"
    echo "- makeOpenAIRequest"
    echo "- OpenAI"
    echo "- timeout"
    echo "- AbortError"
}

# Main menu
show_menu() {
    echo ""
    echo "🔧 Railway Monitoring Menu:"
    echo "==========================="
    echo "1. Monitor photo replacement logs (refresh every 2s)"
    echo "2. Show recent activity"
    echo "3. Test debug endpoint"
    echo "4. Deploy updated code"
    echo "5. Open Railway dashboard (recommended)"
    echo "6. Exit"
    echo ""
    read -p "Select an option (1-6): " choice
}

# Main execution
main() {
    echo "🚀 Starting Railway monitor..."
    echo ""
    
    # Check Railway CLI
    check_railway_cli
    
    # Check authentication
    if ! check_railway_auth; then
        echo "Please run 'railway login' first"
        exit 1
    fi
    
    while true; do
        show_menu
        
        case $choice in
            1)
                monitor_railway_logs
                ;;
            2)
                show_recent_logs
                ;;
            3)
                test_debug_endpoint
                ;;
            4)
                deploy_to_railway
                ;;
            5)
                open_railway_dashboard
                ;;
            6)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid option. Please select 1-6."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run the main function
main
