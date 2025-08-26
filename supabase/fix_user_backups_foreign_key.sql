-- Fix user_backups foreign key constraint to allow keeping backups after user deletion
-- This allows us to preserve backup records even when the original user is deleted

-- Drop the existing foreign key constraint
ALTER TABLE user_backups DROP CONSTRAINT IF EXISTS fk_user_backups_user_id;

-- Recreate the foreign key constraint with ON DELETE SET NULL
-- This will set user_id to NULL when the referenced profile is deleted
ALTER TABLE user_backups 
  ADD CONSTRAINT fk_user_backups_user_id 
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
  ON DELETE SET NULL;

-- Also allow user_id to be NULL since we want to keep backups after user deletion
ALTER TABLE user_backups ALTER COLUMN user_id DROP NOT NULL;

-- Add a comment to explain the purpose
COMMENT ON COLUMN user_backups.user_id IS 'User ID that was backed up. Can be NULL if user was deleted but backup preserved.';
