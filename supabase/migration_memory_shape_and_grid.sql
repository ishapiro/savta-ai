-- Comprehensive migration for memory shape and grid layout features
-- This migration handles both the memory_shape column and grid_layout changes

-- Add memory_shape column with 'original' as default (renamed from 'natural')
ALTER TABLE memory_books 
ADD COLUMN memory_shape text default 'original' check (memory_shape in ('round', 'oval', 'original'));

-- Update existing records to have the default value
UPDATE memory_books 
SET memory_shape = 'original' 
WHERE memory_shape IS NULL;

-- Ensure grid_layout column exists and has proper constraints
-- (This handles the case where grid_layout might not exist or have different constraints)
DO $$ 
BEGIN
    -- Check if grid_layout column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'memory_books' AND column_name = 'grid_layout'
    ) THEN
        -- Add grid_layout column if it doesn't exist
        ALTER TABLE memory_books ADD COLUMN grid_layout text default '2x2';
    END IF;
    
    -- Update grid_layout constraint to include all valid options
    BEGIN
        ALTER TABLE memory_books DROP CONSTRAINT IF EXISTS memory_books_grid_layout_check;
        ALTER TABLE memory_books ADD CONSTRAINT memory_books_grid_layout_check 
            CHECK (grid_layout in ('1x1', '2x1', '2x2', '3x2', '3x3', '3x4', '4x4'));
    EXCEPTION
        WHEN duplicate_object THEN
            -- Constraint already exists, update it
            ALTER TABLE memory_books DROP CONSTRAINT memory_books_grid_layout_check;
            ALTER TABLE memory_books ADD CONSTRAINT memory_books_grid_layout_check 
                CHECK (grid_layout in ('1x1', '2x1', '2x2', '3x2', '3x3', '3x4', '4x4'));
    END;
    
    -- Update any existing grid_layout values to valid ones
    UPDATE memory_books 
    SET grid_layout = '2x2' 
    WHERE grid_layout IS NULL OR grid_layout NOT IN ('1x1', '2x1', '2x2', '3x2', '3x3', '3x4', '4x4');
    
END $$; 