-- Migration: Add rounded flag, size field, and orientation field to themes table
-- Date: 2024-12-19

-- Add new columns to themes table
ALTER TABLE themes ADD COLUMN IF NOT EXISTS rounded boolean DEFAULT false;
ALTER TABLE themes ADD COLUMN IF NOT EXISTS size text DEFAULT '8.5x11' CHECK (size in ('3x5', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12'));

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_themes_rounded ON themes(rounded);
CREATE INDEX IF NOT EXISTS idx_themes_size ON themes(size);

-- Update existing themes to have default values
UPDATE themes SET 
  rounded = false,
  size = '8.5x11'
WHERE rounded IS NULL OR size IS NULL;

-- Update memory_books table to use the same size options
-- First, drop the existing print_size column if it exists
ALTER TABLE memory_books DROP COLUMN IF EXISTS print_size;

-- Add the new print_size column with the same constraints as themes
ALTER TABLE memory_books ADD COLUMN print_size text DEFAULT '8.5x11' CHECK (print_size in ('3x5', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12'));

-- Add index for memory_books print_size
CREATE INDEX IF NOT EXISTS idx_memory_books_print_size ON memory_books(print_size);

-- Update existing memory books to have default size
UPDATE memory_books SET print_size = '8.5x11' WHERE print_size IS NULL; 