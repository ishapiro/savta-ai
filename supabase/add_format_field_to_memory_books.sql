-- Migration: Add format field to memory_books table
-- This field will differentiate between 'card' and 'book' formats
-- Created: 2025-08-11

-- Add the format column with a default value of 'book'
ALTER TABLE memory_books 
ADD COLUMN IF NOT EXISTS format VARCHAR(10) DEFAULT 'book' CHECK (format IN ('card', 'book'));

-- Populate existing data based on current logic
-- Wizard UI creates cards, form UI creates books
UPDATE memory_books 
SET format = CASE 
  WHEN ui = 'wizard' THEN 'card'
  ELSE 'book'
END
WHERE format IS NULL OR format = 'book';

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_memory_books_format ON memory_books(format);

-- Add a comment to document the field
COMMENT ON COLUMN memory_books.format IS 'Content format: card (single-page) or book (multi-page)';
