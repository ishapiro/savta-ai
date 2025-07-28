-- Migration: Add rounded flag and standardized size options to themes and memory_books tables
-- Date: 2024-12-19
-- Description: Adds rounded flag to themes table and updates size options in both themes and memory_books tables

-- ============================================================================
-- THEMES TABLE CHANGES
-- ============================================================================

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

-- ============================================================================
-- MEMORY_BOOKS TABLE CHANGES
-- ============================================================================

-- Update memory_books table to use the same size options
-- First, drop the existing print_size column if it exists
ALTER TABLE memory_books DROP COLUMN IF EXISTS print_size;

-- Add the new print_size column with the same constraints as themes
ALTER TABLE memory_books ADD COLUMN print_size text DEFAULT '8.5x11' CHECK (print_size in ('3x5', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12'));

-- Add index for memory_books print_size
CREATE INDEX IF NOT EXISTS idx_memory_books_print_size ON memory_books(print_size);

-- Update existing memory books to have default size
UPDATE memory_books SET print_size = '8.5x11' WHERE print_size IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify themes table structure
DO $$
BEGIN
  RAISE NOTICE 'Verifying themes table structure...';
  
  -- Check if rounded column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'themes' AND column_name = 'rounded'
  ) THEN
    RAISE NOTICE '✓ rounded column exists in themes table';
  ELSE
    RAISE NOTICE '✗ rounded column missing from themes table';
  END IF;
  
  -- Check if size column exists with correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'themes' AND column_name = 'size'
  ) THEN
    RAISE NOTICE '✓ size column exists in themes table';
  ELSE
    RAISE NOTICE '✗ size column missing from themes table';
  END IF;
  
  -- Check if orientation column was removed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'themes' AND column_name = 'orientation'
  ) THEN
    RAISE NOTICE '✓ orientation column properly removed from themes table';
  ELSE
    RAISE NOTICE '✗ orientation column still exists in themes table';
  END IF;
END $$;

-- Verify memory_books table structure
DO $$
BEGIN
  RAISE NOTICE 'Verifying memory_books table structure...';
  
  -- Check if print_size column exists with correct constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memory_books' AND column_name = 'print_size'
  ) THEN
    RAISE NOTICE '✓ print_size column exists in memory_books table';
  ELSE
    RAISE NOTICE '✗ print_size column missing from memory_books table';
  END IF;
END $$;

-- ============================================================================
-- DATA INTEGRITY CHECKS
-- ============================================================================

-- Check for any themes with invalid size values
DO $$
DECLARE
  invalid_count integer;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM themes 
  WHERE size NOT IN ('3x5', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12');
  
  IF invalid_count > 0 THEN
    RAISE NOTICE '⚠ Found % themes with invalid size values', invalid_count;
  ELSE
    RAISE NOTICE '✓ All themes have valid size values';
  END IF;
END $$;

-- Check for any memory_books with invalid print_size values
DO $$
DECLARE
  invalid_count integer;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM memory_books 
  WHERE print_size NOT IN ('3x5', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12');
  
  IF invalid_count > 0 THEN
    RAISE NOTICE '⚠ Found % memory books with invalid print_size values', invalid_count;
  ELSE
    RAISE NOTICE '✓ All memory books have valid print_size values';
  END IF;
END $$;

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '✓ Added rounded boolean field to themes table (default: false)';
  RAISE NOTICE '✓ Updated size field in themes table with standardized options';
  RAISE NOTICE '✓ Removed orientation field from themes table';
  RAISE NOTICE '✓ Updated print_size field in memory_books table with same options';
  RAISE NOTICE '✓ Added appropriate indexes for performance';
  RAISE NOTICE '✓ Updated existing records with default values';
  RAISE NOTICE '';
  RAISE NOTICE 'Available size options:';
  RAISE NOTICE '  Portrait: 3x5, 5x7, 8x10, 8.5x11, 11x14';
  RAISE NOTICE '  Landscape: 5x3, 7x5, 10x8, 11x8.5, 14x11';
  RAISE NOTICE '  Square: 12x12';
  RAISE NOTICE '  Default: 8.5x11';
END $$; 