-- Migration to rename 'title' field to 'ai_supplemental_prompt' in memory_books table
-- This field is used by the AI to help select photos and create stories

-- Rename the column
ALTER TABLE memory_books RENAME COLUMN title TO ai_supplemental_prompt;

-- Add a comment to document the purpose of this field
COMMENT ON COLUMN memory_books.ai_supplemental_prompt IS 'AI supplemental prompt used to help select photos and create stories for memory books'; 