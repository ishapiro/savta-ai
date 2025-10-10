# Supabase MCP Server - Quick Start

## Setup (2 minutes)

### Option 1: Automated Setup (Recommended)
```bash
./scripts/setup-mcp.sh
```

### Option 2: Manual Setup
1. Edit `.cursor/mcp.json`
2. Replace `YOUR_PASSWORD` and `YOUR_HOST` with your Supabase credentials
3. Restart Cursor.ai

## Get Your Credentials

Go to **Supabase Dashboard → Settings → Database**

- **Host**: `db.xxxxxxxxxxxxx.supabase.co`
- **Password**: Your database password

## Usage

Type `@supabase` in Cursor.ai chat, then ask questions:

### Common Queries

```
@supabase Show me all tables
@supabase What columns are in the memory_books table?
@supabase Count memory books by status
@supabase Show recent face recognition activity
@supabase List all RLS policies on the assets table
```

### Schema Exploration

```
@supabase Explain the relationship between faces and person_groups
@supabase What indexes exist on the faces table?
@supabase Show me the face recognition database schema
```

### Data Analysis

```
@supabase How many users have created memory books?
@supabase Show memory books created this week
@supabase Which users have uploaded the most photos?
```

## Security

✅ **Already secured** - `.cursor/mcp.json` is in `.gitignore`  
🔒 **Credentials safe** - Not committed to git  
👍 **Read-only option** - See full docs for setup

## Troubleshooting

**Can't see @supabase?**
- Restart Cursor.ai completely
- Check `.cursor/mcp.json` exists and has valid JSON
- Verify credentials are correct

**Connection failed?**
- Test with: `susql -c "SELECT 1;"`
- Check network/firewall

## Full Documentation

📚 See [`MCP_SERVER_SETUP.md`](./MCP_SERVER_SETUP.md) for complete guide

---

**Tip**: Combine with `susql` for the best workflow:
- **MCP**: AI-assisted queries and exploration
- **susql**: Direct SQL and migrations

