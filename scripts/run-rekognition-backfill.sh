#!/bin/bash

# Helper script to run Rekognition Collections backfill
# This provides an easy-to-use interface for the backfill script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 AWS Rekognition Collections Backfill Helper"
echo "================================================"
echo ""

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo "❌ Error: .env file not found in project root"
    echo "   Please create .env with required environment variables"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)

# Check required environment variables
if [ -z "$NUXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "   NUXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env"
    exit 1
fi

# Display menu
echo "Select backfill mode:"
echo ""
echo "  1) Dry run (show what would be processed)"
echo "  2) Process ALL users and assets"
echo "  3) Process specific user"
echo "  4) Test run (limit 10 assets per user)"
echo "  5) Cancel"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "🔍 Running dry run..."
        node "$SCRIPT_DIR/backfill-rekognition-collections.js" --dry-run
        ;;
    2)
        echo ""
        echo "⚠️  This will process ALL users and assets"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ] || [ "$confirm" = "y" ]; then
            node "$SCRIPT_DIR/backfill-rekognition-collections.js"
        else
            echo "❌ Cancelled"
            exit 0
        fi
        ;;
    3)
        echo ""
        read -p "Enter user ID (UUID): " user_id
        if [ -z "$user_id" ]; then
            echo "❌ Error: User ID cannot be empty"
            exit 1
        fi
        node "$SCRIPT_DIR/backfill-rekognition-collections.js" --user-id="$user_id"
        ;;
    4)
        echo ""
        echo "🧪 Running test with 10 assets per user..."
        node "$SCRIPT_DIR/backfill-rekognition-collections.js" --limit=10
        ;;
    5)
        echo "❌ Cancelled"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Script completed"

