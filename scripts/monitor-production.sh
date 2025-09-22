#!/bin/bash

# Production monitoring script for photo replacement debugging
# This script helps monitor production logs and identify issues

echo "🔍 Production Photo Replacement Monitor"
echo "====================================="

# Configuration
LOG_FILE="/var/log/your-app.log"  # Update this path to your actual log file
APP_NAME="savta-ai"
MONITOR_DURATION=300  # 5 minutes

echo "📊 Monitoring Configuration:"
echo "- Log file: $LOG_FILE"
echo "- App name: $APP_NAME"
echo "- Duration: ${MONITOR_DURATION} seconds"
echo "- Start time: $(date)"
echo ""

# Function to check if log file exists
check_log_file() {
    if [ ! -f "$LOG_FILE" ]; then
        echo "❌ Log file not found: $LOG_FILE"
        echo "Please update the LOG_FILE variable in this script to point to your actual log file"
        echo ""
        echo "Common log locations:"
        echo "- PM2: ~/.pm2/logs/"
        echo "- Docker: docker logs <container_name>"
        echo "- Systemd: journalctl -u <service_name>"
        echo "- Nginx: /var/log/nginx/"
        return 1
    fi
    return 0
}

# Function to monitor photo replacement logs
monitor_photo_replacement() {
    echo "🔍 Monitoring photo replacement logs..."
    echo "Looking for patterns: 🔄 🎯 🔗 DEBUG"
    echo ""
    
    tail -f "$LOG_FILE" | grep --line-buffered -E "(🔄|🎯|🔗|DEBUG|Photo replacement|selectPhotosByAttributes|makeOpenAIRequest)" | while read line; do
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        echo "[$timestamp] $line"
    done
}

# Function to monitor OpenAI API calls
monitor_openai_calls() {
    echo "🔍 Monitoring OpenAI API calls..."
    echo "Looking for patterns: OpenAI, API request, API response, timeout"
    echo ""
    
    tail -f "$LOG_FILE" | grep --line-buffered -E "(OpenAI|API request|API response|timeout|AbortError|5 minutes)" | while read line; do
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        echo "[$timestamp] $line"
    done
}

# Function to monitor errors
monitor_errors() {
    echo "🔍 Monitoring errors..."
    echo "Looking for patterns: ERROR, error, failed, timeout, AbortError"
    echo ""
    
    tail -f "$LOG_FILE" | grep --line-buffered -iE "(error|failed|timeout|abort)" | while read line; do
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        echo "[$timestamp] $line"
    done
}

# Function to show recent photo replacement activity
show_recent_activity() {
    echo "📋 Recent Photo Replacement Activity:"
    echo "===================================="
    
    if [ -f "$LOG_FILE" ]; then
        echo "Last 20 lines containing photo replacement activity:"
        grep -E "(🔄|🎯|🔗|DEBUG|Photo replacement)" "$LOG_FILE" | tail -20
    else
        echo "Log file not found. Please check the path."
    fi
    echo ""
}

# Function to check system resources
check_system_resources() {
    echo "💻 System Resources:"
    echo "==================="
    echo "CPU Usage:"
    top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
    echo ""
    echo "Memory Usage:"
    free -h
    echo ""
    echo "Disk Usage:"
    df -h | grep -E "(/$|/var|/tmp)"
    echo ""
    echo "Network Connections:"
    netstat -an | grep -E "(ESTABLISHED|TIME_WAIT)" | wc -l
    echo "Active connections: $(netstat -an | grep ESTABLISHED | wc -l)"
    echo ""
}

# Function to test OpenAI API connectivity
test_openai_connectivity() {
    echo "🌐 Testing OpenAI API Connectivity:"
    echo "==================================="
    
    # Test basic connectivity
    echo "Testing basic connectivity to OpenAI API..."
    if curl -s -I https://api.openai.com/v1 > /dev/null 2>&1; then
        echo "✅ Basic connectivity to OpenAI API: OK"
    else
        echo "❌ Basic connectivity to OpenAI API: FAILED"
    fi
    
    # Test DNS resolution
    echo "Testing DNS resolution..."
    if nslookup api.openai.com > /dev/null 2>&1; then
        echo "✅ DNS resolution: OK"
    else
        echo "❌ DNS resolution: FAILED"
    fi
    
    echo ""
}

# Main menu
show_menu() {
    echo "🔧 Production Monitoring Menu:"
    echo "============================="
    echo "1. Monitor photo replacement logs"
    echo "2. Monitor OpenAI API calls"
    echo "3. Monitor errors"
    echo "4. Show recent activity"
    echo "5. Check system resources"
    echo "6. Test OpenAI connectivity"
    echo "7. Monitor all (recommended)"
    echo "8. Exit"
    echo ""
    read -p "Select an option (1-8): " choice
}

# Main execution
main() {
    if ! check_log_file; then
        exit 1
    fi
    
    while true; do
        show_menu
        
        case $choice in
            1)
                monitor_photo_replacement
                ;;
            2)
                monitor_openai_calls
                ;;
            3)
                monitor_errors
                ;;
            4)
                show_recent_activity
                ;;
            5)
                check_system_resources
                ;;
            6)
                test_openai_connectivity
                ;;
            7)
                echo "🔍 Starting comprehensive monitoring..."
                echo "Press Ctrl+C to stop"
                echo ""
                # Run all monitors in parallel
                monitor_photo_replacement &
                monitor_openai_calls &
                monitor_errors &
                wait
                ;;
            8)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid option. Please select 1-8."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        echo ""
    done
}

# Run the main function
main
