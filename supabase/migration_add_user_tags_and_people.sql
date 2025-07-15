-- Migration: Add user tags, user people, title, and rejected fields to assets table
-- This migration adds support for user-added tags and people that are preserved when AI is rerun

-- Add new columns to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS user_tags text[] default array[]::text[],
ADD COLUMN IF NOT EXISTS user_people jsonb default '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rejected boolean default false;

-- Create index for rejected field for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_rejected ON assets(rejected);

-- Update existing assets to initialize user_tags and user_people as empty arrays
UPDATE assets 
SET user_tags = array[]::text[], 
    user_people = '[]'::jsonb 
WHERE user_tags IS NULL OR user_people IS NULL; 