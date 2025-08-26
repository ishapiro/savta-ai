-- Add original_email field to user_backups table
-- This allows us to always know which user a backup was for, even after the user is deleted

-- Add the original_email column
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS original_email text;

-- Add an index for efficient queries by email
CREATE INDEX IF NOT EXISTS idx_user_backups_original_email ON user_backups(original_email);

-- Add a comment to explain the purpose
COMMENT ON COLUMN user_backups.original_email IS 'Original email of the user who was backed up. Preserved even when user_id becomes null after user deletion.';
