-- Fix memory_books status constraint to include 'background_ready'
-- This migration updates the existing constraint to allow the new status

-- Drop the existing constraint
ALTER TABLE memory_books DROP CONSTRAINT IF EXISTS memory_books_status_check;

-- Add the new constraint with 'background_ready' included
ALTER TABLE memory_books ADD CONSTRAINT memory_books_status_check 
  CHECK (status in ('draft', 'ready', 'background_ready', 'approved', 'distributed'));

-- Verify the change
SELECT 'Memory books status constraint updated successfully' as status; 