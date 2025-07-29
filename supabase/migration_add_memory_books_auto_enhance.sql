-- Migration: Add auto_enhance field to memory_books
ALTER TABLE memory_books ADD COLUMN IF NOT EXISTS auto_enhance boolean DEFAULT false; 