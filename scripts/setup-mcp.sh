#!/bin/bash

# Supabase MCP Server Setup Script
# This script helps configure the Supabase MCP server for Cursor.ai

set -e

echo "🔧 Supabase MCP Server Setup for Cursor.ai"
echo "==========================================="
echo ""

# Check if .cursor directory exists
if [ ! -d ".cursor" ]; then
    echo "✅ Creating .cursor directory..."
    mkdir -p .cursor
fi

# Check if mcp.json already exists
if [ -f ".cursor/mcp.json" ]; then
    echo "⚠️  Warning: .cursor/mcp.json already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. No changes made."
        exit 0
    fi
fi

echo ""
echo "📝 Please enter your Supabase database credentials:"
echo "   (You can find these in Supabase Dashboard → Settings → Database)"
echo ""

# Get database credentials
read -p "Database Host (e.g., db.xxxxxxxxxxxxx.supabase.co): " DB_HOST
read -s -p "Database Password: " DB_PASSWORD
echo ""

# Validate inputs
if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: Host and password are required!"
    exit 1
fi

# Create the MCP configuration
cat > .cursor/mcp.json << EOF
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server",
        "--connection-string",
        "postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/postgres"
      ],
      "description": "Supabase MCP Server for direct database access"
    }
  }
}
EOF

echo ""
echo "✅ MCP configuration created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Restart Cursor.ai completely"
echo "   2. Reopen this project"
echo "   3. Test by typing @supabase in the AI chat"
echo ""
echo "📚 Documentation: docs/MCP_SERVER_SETUP.md"
echo ""
echo "🔒 Security Note:"
echo "   - The .cursor/mcp.json file contains your database password"
echo "   - This file is in .gitignore and will NOT be committed to git"
echo "   - Keep your credentials secure!"
echo ""

