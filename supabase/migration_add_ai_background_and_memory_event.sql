-- Migration: Add ai_background and memory_event fields to memory_books table
-- Date: 2024-12-19

-- Add ai_background field (boolean, defaults to true)
ALTER TABLE memory_books 
ADD COLUMN IF NOT EXISTS ai_background boolean DEFAULT true;

-- Add memory_event field (text, no constraints to allow any value)
ALTER TABLE memory_books 
ADD COLUMN IF NOT EXISTS memory_event text;

-- Add comment to document the purpose of these fields
COMMENT ON COLUMN memory_books.ai_background IS 'Whether to use AI-generated background for the memory book';
COMMENT ON COLUMN memory_books.memory_event IS 'Type of memory event (e.g., vacation, birthday, anniversary, graduation, family trip, or custom)'; 