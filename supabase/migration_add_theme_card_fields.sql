-- Migration: Add card_default and card_wizard fields to themes table
-- This migration adds two new boolean fields to the themes table:
-- - card_default: indicates this is the default layout for the magic card wizard
-- - card_wizard: indicates this layout should be displayed in the card wizard

-- Add new columns to themes table (safe to rerun)
DO $$
BEGIN
  -- Add card_default column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'card_default'
  ) THEN
    ALTER TABLE themes ADD COLUMN card_default boolean DEFAULT false;
  END IF;
  
  -- Add card_wizard column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'card_wizard'
  ) THEN
    ALTER TABLE themes ADD COLUMN card_wizard boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for the new fields for better performance
CREATE INDEX IF NOT EXISTS idx_themes_card_default ON themes(card_default);
CREATE INDEX IF NOT EXISTS idx_themes_card_wizard ON themes(card_wizard); 