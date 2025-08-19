-- Migration to remove magic story requirement from memory_books trigger
-- This fixes the error: 'Magic story is required for card format when status is not draft/template'

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS validate_memory_book_fields_trigger ON memory_books;
DROP FUNCTION IF EXISTS validate_memory_book_fields();

-- Recreate the function without the magic story requirement
CREATE OR REPLACE FUNCTION validate_memory_book_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip validation if we're just marking as deleted
  IF NEW.deleted = true AND (OLD.deleted = false OR OLD.deleted IS NULL) THEN
    RETURN NEW;
  END IF;
  
  -- For draft and template status, allow empty/null values for certain fields
  IF NEW.status IN ('draft', 'template') THEN
    -- Allow empty magic_story for draft/template status
    IF NEW.magic_story IS NOT NULL AND NEW.magic_story = '' THEN
      NEW.magic_story := NULL;
    END IF;
    
    -- Allow empty created_from_assets for draft/template status
    IF NEW.created_from_assets IS NOT NULL AND array_length(NEW.created_from_assets, 1) = 0 THEN
      NEW.created_from_assets := NULL;
    END IF;
    
    -- Allow empty photo_selection_pool for draft/template status
    IF NEW.photo_selection_pool IS NOT NULL AND array_length(NEW.photo_selection_pool, 1) = 0 THEN
      NEW.photo_selection_pool := NULL;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- For other statuses, ensure required fields are present
  IF NEW.status NOT IN ('draft', 'template') THEN
    -- Require created_from_assets for non-draft statuses
    IF NEW.created_from_assets IS NULL OR array_length(NEW.created_from_assets, 1) = 0 THEN
      RAISE EXCEPTION 'Created from assets is required when status is not draft/template';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER validate_memory_book_fields_trigger
  BEFORE INSERT OR UPDATE ON memory_books
  FOR EACH ROW
  EXECUTE FUNCTION validate_memory_book_fields();

-- Log the migration
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('fix_magic_story_requirement', NOW())
ON CONFLICT (version) DO NOTHING;
