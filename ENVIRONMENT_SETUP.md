# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Optional
NUXT_PUBLIC_SITE_URL=http://localhost:3000
INSIDER_PASSWORD=savta2025
```

## Getting Your Supabase Keys

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL**: Use this for `NUXT_PUBLIC_SUPABASE_URL`
   - **anon public**: Use this for `NUXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: Use this for `SUPABASE_SERVICE_ROLE_KEY`

## Getting Your OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key and use it for `OPENAI_API_KEY`

## Important Notes

- The **service role key** is required for server-side operations that need to bypass Row Level Security (RLS)
- Never expose the service role key in client-side code
- The anon key is safe to use in client-side code
- Restart your development server after adding environment variables

## Testing the Setup

After setting up your environment variables:

1. Restart your development server: `npm run dev`
2. Try uploading a photo
3. Check the console logs for any authentication errors
4. The AI processing should now work correctly with the service role key 