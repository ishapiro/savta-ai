-- Migration: Add ui field to memory_books table
-- This migration adds a new 'ui' field to separate UI presentation from layout generation
-- - ui: 'wizard' - uses the wizard dialog (like current magic books)
-- - ui: 'form' - uses the form dialog (like current grid books)

-- Add ui column to memory_books table (safe to rerun)
DO $$
BEGIN
  -- Add ui column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'ui'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN ui text DEFAULT 'form' CHECK (ui IN ('wizard', 'form'));
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_memory_books_ui ON memory_books(ui);

-- Update existing records to set ui based on current layout_type
-- This ensures backward compatibility
UPDATE memory_books 
SET ui = CASE 
  WHEN layout_type = 'magic' THEN 'wizard'
  ELSE 'form'
END
WHERE ui IS NULL OR ui = 'form';

-- Add comment to document the field
COMMENT ON COLUMN memory_books.ui IS 'UI presentation type: wizard (multi-step dialog) or form (single form dialog)'; 