-- Migration: Add photo_selection_pool field to memory_books table
-- This field stores the user's photo selection pool (up to 12 photos they want to consider)

-- Add the new column
ALTER TABLE memory_books 
ADD COLUMN IF NOT EXISTS photo_selection_pool uuid[] default array[]::uuid[];

-- For existing magic memory books, initialize photo_selection_pool with created_from_assets
-- This ensures existing magic memories have a photo selection pool
UPDATE memory_books 
SET photo_selection_pool = created_from_assets 
WHERE layout_type = 'magic' 
AND photo_selection_pool IS NULL 
AND created_from_assets IS NOT NULL 
AND array_length(created_from_assets, 1) > 0;

-- Add a comment to document the field
COMMENT ON COLUMN memory_books.photo_selection_pool IS 'Array of up to 12 photo IDs that the user selected for consideration in this memory book. For magic memories, the AI will select the best photos from this pool.'; 