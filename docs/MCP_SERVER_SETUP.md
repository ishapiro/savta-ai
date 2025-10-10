# Supabase MCP Server Setup for Cursor.ai

## Overview

The Supabase MCP (Model Context Protocol) Server allows Cursor.ai to directly interact with your Supabase database. This enables the AI to:

- Query database schema and structure
- Execute SQL queries
- Inspect table data
- Understand database relationships
- Assist with database migrations

## Prerequisites

- Cursor.ai IDE installed
- Supabase project with database credentials
- Node.js 18+ installed
- `npx` available in your PATH

## Configuration

### Step 1: Get Your Supabase Database Credentials

1. Go to your **Supabase Dashboard**
2. Navigate to **Settings → Database**
3. Copy the following information:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: Your database password

### Step 2: Configure the MCP Server

The MCP configuration file is located at `.cursor/mcp.json` in the project root.

**Edit the configuration file**:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server",
        "--connection-string",
        "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"
      ],
      "description": "Supabase MCP Server for direct database access"
    }
  }
}
```

**Replace the placeholders**:
- `[YOUR-PASSWORD]`: Your Supabase database password
- `[YOUR-HOST]`: Your Supabase database host (e.g., `db.abcdefghijklmnop.supabase.co`)

**Example**:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server",
        "--connection-string",
        "postgresql://postgres:your-secure-password@db.abcdefghijklmnop.supabase.co:5432/postgres"
      ],
      "description": "Supabase MCP Server for direct database access"
    }
  }
}
```

### Step 3: Restart Cursor.ai

1. **Close Cursor.ai completely**
2. **Reopen Cursor.ai**
3. **Open your project**: `/home/irvshapiro/drvax_code/savta-ai`

### Step 4: Verify MCP Server Connection

1. Open the **Cursor AI chat**
2. Type: `@supabase` - you should see the Supabase MCP server as an option
3. Try a test query: `@supabase show me all tables in the database`

## Usage Examples

### Querying Database Schema

```
@supabase List all tables in the database
```

```
@supabase Show me the schema for the memory_books table
```

```
@supabase What are the relationships between assets and memory_books?
```

### Inspecting Data

```
@supabase Show me the first 10 memory books
```

```
@supabase Count the number of users in the profiles table
```

```
@supabase Show me the face recognition tables and their structure
```

### Database Analysis

```
@supabase What indexes exist on the faces table?
```

```
@supabase Show me all RLS policies on the assets table
```

```
@supabase List all database functions related to face recognition
```

## Security Considerations

### 🔒 Important Security Notes

1. **Never commit database credentials**:
   - The `.cursor/mcp.json` file contains your database password
   - This file is already in `.gitignore`
   - Verify: `git status` should NOT show `.cursor/mcp.json`

2. **Use read-only credentials (optional)**:
   - For added security, create a read-only database user
   - Grant only `SELECT` permissions
   - Use this user for MCP instead of `postgres`

3. **Rotate credentials regularly**:
   - Change your database password periodically
   - Update `.cursor/mcp.json` when credentials change

### Creating a Read-Only User (Optional)

If you want extra security, create a read-only user:

```sql
-- Connect to your Supabase database via SQL Editor
CREATE USER cursor_readonly WITH PASSWORD 'your-secure-password';
GRANT USAGE ON SCHEMA public TO cursor_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO cursor_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cursor_readonly;
```

Then update `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server",
        "--connection-string",
        "postgresql://cursor_readonly:your-secure-password@[YOUR-HOST]:5432/postgres"
      ],
      "description": "Supabase MCP Server (Read-Only)"
    }
  }
}
```

## Troubleshooting

### MCP Server Not Appearing in Cursor

**Issue**: `@supabase` doesn't appear in autocomplete

**Solutions**:
1. Verify the `.cursor/mcp.json` file exists in project root
2. Check JSON syntax is valid (use a JSON validator)
3. Restart Cursor.ai completely (not just reload window)
4. Check Cursor.ai settings → MCP section for error messages

### Connection Failed

**Issue**: MCP server can't connect to database

**Solutions**:
1. Verify database credentials are correct
2. Check network connectivity to Supabase
3. Ensure your IP is not blocked by Supabase
4. Test connection with `psql` or `susql` alias:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -c "SELECT 1;"
   ```

### npx Command Not Found

**Issue**: `command not found: npx`

**Solutions**:
1. Ensure Node.js is installed: `node --version`
2. Reinstall Node.js if needed
3. Verify `npx` is in PATH: `which npx`

### MCP Server Installation Issues

**Issue**: `@supabase/mcp-server` fails to install

**Solutions**:
1. Clear npx cache: `npx clear-npx-cache`
2. Manually install: `npm install -g @supabase/mcp-server`
3. Update Node.js to latest LTS version
4. Check npm registry access

## Advanced Configuration

### Multiple Database Connections

You can configure multiple MCP servers for different databases:

```json
{
  "mcpServers": {
    "supabase-production": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server",
        "--connection-string",
        "postgresql://postgres:[PROD-PASSWORD]@[PROD-HOST]:5432/postgres"
      ],
      "description": "Production Supabase Database"
    },
    "supabase-staging": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server",
        "--connection-string",
        "postgresql://postgres:[STAGING-PASSWORD]@[STAGING-HOST]:5432/postgres"
      ],
      "description": "Staging Supabase Database"
    }
  }
}
```

Then use: `@supabase-production` or `@supabase-staging` in your queries.

### Custom Server Options

The Supabase MCP server supports additional options:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server",
        "--connection-string",
        "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres",
        "--schema",
        "public",
        "--max-connections",
        "5"
      ],
      "description": "Supabase MCP Server with custom options"
    }
  }
}
```

## Benefits of Using MCP

### For Development

1. **Schema Understanding**: AI can understand your database structure
2. **Query Assistance**: Get help writing complex SQL queries
3. **Migration Help**: AI can suggest and verify migrations
4. **Data Inspection**: Quickly check data without leaving the editor

### For Debugging

1. **Quick Queries**: Ask AI to query database during debugging
2. **Relationship Discovery**: Find data connections easily
3. **Performance Analysis**: Check indexes and query plans
4. **Error Investigation**: Inspect data causing errors

### For Documentation

1. **Auto-Generated Docs**: AI can document database schema
2. **Relationship Diagrams**: Generate ER diagrams from schema
3. **Migration History**: Track schema changes over time

## Integration with Existing Workflow

### Combining with susql Alias

You already have the `susql` alias for direct database access. Use both:

- **MCP (via Cursor AI)**: For AI-assisted queries and exploration
  - Example: "Show me recent memory books with their asset counts"
  
- **susql (terminal)**: For direct SQL execution and migrations
  - Example: `susql < supabase/schema.sql`

### Combining with Supabase Dashboard

Use all three tools together:

1. **Supabase Dashboard**: Visual database management, RLS policies
2. **MCP in Cursor**: AI-assisted queries and schema exploration
3. **susql (terminal)**: Migrations and batch operations

## Example Workflows

### Database Schema Exploration

```
You: @supabase Show me all tables related to face recognition
AI: Lists face_collections, faces, person_groups, etc.

You: @supabase Explain the relationship between faces and person_groups
AI: Shows the face_person_links junction table and relationships

You: @supabase What columns does the faces table have?
AI: Lists columns with types: id, user_id, asset_id, face_vector, etc.
```

### Data Analysis

```
You: @supabase How many memory books were created in the last week?
AI: Executes query and returns count

You: @supabase Show me memory books with status 'draft'
AI: Returns draft memory books with details

You: @supabase Which users have uploaded the most assets?
AI: Provides user statistics from assets table
```

### Migration Planning

```
You: I want to add a 'tags' column to memory_books table. @supabase what's the current structure?
AI: Shows current table structure

You: @supabase Check if there are any constraints that might affect adding this column
AI: Lists foreign keys, indexes, RLS policies

You: Help me write a migration to add the tags column
AI: Generates ALTER TABLE statement
```

## Related Documentation

- [`technical.md`](./technical.md) - Complete technical specifications
- [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md) - Environment configuration
- [`README.md`](./README.md) - Documentation index
- [Supabase MCP Server GitHub](https://github.com/supabase/mcp-server) - Official documentation

## Maintenance

### Updating MCP Server

The `@supabase/mcp-server` is automatically fetched via `npx -y`, which always gets the latest version. To force an update:

```bash
npx clear-npx-cache
```

Then restart Cursor.ai.

### Updating Connection String

If your Supabase credentials change:

1. Update `.cursor/mcp.json` with new credentials
2. Restart Cursor.ai
3. Verify connection with a test query

---

**Last Updated**: 2025-01-10  
**MCP Server Version**: Latest (via npx)  
**Project**: Savta.ai Memory Books & Cards

