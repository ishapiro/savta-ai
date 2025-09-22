#!/bin/bash

# Quick monitoring script for production photo replacement debugging
# This script works with common deployment setups

echo "🔍 Quick Photo Replacement Monitor"
echo "=================================="

# Function to detect deployment type
detect_deployment() {
    if command -v pm2 >/dev/null 2>&1; then
        echo "📦 Detected PM2 deployment"
        return "pm2"
    elif command -v docker >/dev/null 2>&1; then
        echo "🐳 Detected Docker deployment"
        return "docker"
    elif systemctl is-active --quiet savta-ai 2>/dev/null; then
        echo "⚙️ Detected Systemd deployment"
        return "systemd"
    else
        echo "❓ Unknown deployment type"
        return "unknown"
    fi
}

# Function to monitor PM2 logs
monitor_pm2() {
    echo "🔍 Monitoring PM2 logs for photo replacement..."
    echo "Press Ctrl+C to stop"
    echo ""
    
    pm2 logs savta-ai --lines 0 | grep --line-buffered -E "(🔄|🎯|🔗|DEBUG|Photo replacement|selectPhotosByAttributes|makeOpenAIRequest|OpenAI|timeout|AbortError)"
}

# Function to monitor Docker logs
monitor_docker() {
    echo "🔍 Monitoring Docker logs for photo replacement..."
    echo "Press Ctrl+C to stop"
    echo ""
    
    # Try to find the container name
    CONTAINER_NAME=$(docker ps --format "table {{.Names}}" | grep -i savta | head -1)
    if [ -z "$CONTAINER_NAME" ]; then
        echo "❌ Could not find Savta container. Available containers:"
        docker ps --format "table {{.Names}}\t{{.Image}}"
        echo ""
        read -p "Enter container name: " CONTAINER_NAME
    fi
    
    docker logs -f "$CONTAINER_NAME" | grep --line-buffered -E "(🔄|🎯|🔗|DEBUG|Photo replacement|selectPhotosByAttributes|makeOpenAIRequest|OpenAI|timeout|AbortError)"
}

# Function to monitor systemd logs
monitor_systemd() {
    echo "🔍 Monitoring systemd logs for photo replacement..."
    echo "Press Ctrl+C to stop"
    echo ""
    
    # Try to find the service name
    SERVICE_NAME=$(systemctl list-units --type=service | grep -i savta | head -1 | awk '{print $1}')
    if [ -z "$SERVICE_NAME" ]; then
        echo "❌ Could not find Savta service. Available services:"
        systemctl list-units --type=service | grep -i savta
        echo ""
        read -p "Enter service name: " SERVICE_NAME
    fi
    
    journalctl -u "$SERVICE_NAME" -f | grep --line-buffered -E "(🔄|🎯|🔗|DEBUG|Photo replacement|selectPhotosByAttributes|makeOpenAIRequest|OpenAI|timeout|AbortError)"
}

# Function to show recent activity
show_recent() {
    echo "📋 Recent Photo Replacement Activity:"
    echo "====================================="
    
    DEPLOYMENT=$(detect_deployment)
    
    case $DEPLOYMENT in
        "pm2")
            echo "Last 20 lines from PM2:"
            pm2 logs savta-ai --lines 20 | grep -E "(🔄|🎯|🔗|DEBUG|Photo replacement)"
            ;;
        "docker")
            CONTAINER_NAME=$(docker ps --format "table {{.Names}}" | grep -i savta | head -1)
            if [ -n "$CONTAINER_NAME" ]; then
                echo "Last 20 lines from Docker container $CONTAINER_NAME:"
                docker logs --tail 20 "$CONTAINER_NAME" | grep -E "(🔄|🎯|🔗|DEBUG|Photo replacement)"
            fi
            ;;
        "systemd")
            SERVICE_NAME=$(systemctl list-units --type=service | grep -i savta | head -1 | awk '{print $1}')
            if [ -n "$SERVICE_NAME" ]; then
                echo "Last 20 lines from systemd service $SERVICE_NAME:"
                journalctl -u "$SERVICE_NAME" --lines 20 | grep -E "(🔄|🎯|🔗|DEBUG|Photo replacement)"
            fi
            ;;
        *)
            echo "❌ Could not detect deployment type"
            ;;
    esac
}

# Function to test the debug endpoint
test_debug_endpoint() {
    echo "🧪 Testing debug endpoint..."
    echo "============================"
    
    # Get the site URL
    read -p "Enter your site URL (e.g., https://savta.ai): " SITE_URL
    
    # Get authentication token
    read -p "Enter your auth token (or press Enter to skip): " AUTH_TOKEN
    
    # Get memory book ID
    read -p "Enter memory book ID to test: " MEMORY_BOOK_ID
    
    # Get user ID
    read -p "Enter user ID: " USER_ID
    
    echo ""
    echo "Testing debug endpoint..."
    
    if [ -n "$AUTH_TOKEN" ]; then
        curl -X POST "$SITE_URL/api/debug/photo-replacement-test" \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $AUTH_TOKEN" \
          -d "{\"memoryBookId\":\"$MEMORY_BOOK_ID\",\"userId\":\"$USER_ID\",\"testType\":\"full\"}"
    else
        curl -X POST "$SITE_URL/api/debug/photo-replacement-test" \
          -H 'Content-Type: application/json' \
          -d "{\"memoryBookId\":\"$MEMORY_BOOK_ID\",\"userId\":\"$USER_ID\",\"testType\":\"full\"}"
    fi
    
    echo ""
    echo "✅ Debug endpoint test completed"
}

# Main menu
show_menu() {
    echo ""
    echo "🔧 Quick Monitoring Menu:"
    echo "========================"
    echo "1. Monitor photo replacement logs (real-time)"
    echo "2. Show recent activity"
    echo "3. Test debug endpoint"
    echo "4. Exit"
    echo ""
    read -p "Select an option (1-4): " choice
}

# Main execution
main() {
    echo "🚀 Starting quick monitor..."
    echo ""
    
    # Detect deployment type
    DEPLOYMENT=$(detect_deployment)
    echo "Deployment type: $DEPLOYMENT"
    echo ""
    
    while true; do
        show_menu
        
        case $choice in
            1)
                case $DEPLOYMENT in
                    "pm2")
                        monitor_pm2
                        ;;
                    "docker")
                        monitor_docker
                        ;;
                    "systemd")
                        monitor_systemd
                        ;;
                    *)
                        echo "❌ Unknown deployment type. Please run monitoring manually."
                        echo "Try: pm2 logs savta-ai | grep -E '(🔄|🎯|🔗|DEBUG)'"
                        ;;
                esac
                ;;
            2)
                show_recent
                ;;
            3)
                test_debug_endpoint
                ;;
            4)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid option. Please select 1-4."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run the main function
main
