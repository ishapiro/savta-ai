-- Add original_uuid field to user_backups table
-- This allows us to always access the original user's storage files even after the user is deleted

-- Add the original_uuid column
ALTER TABLE user_backups ADD COLUMN IF NOT EXISTS original_uuid uuid;

-- Add an index for efficient queries by original_uuid
CREATE INDEX IF NOT EXISTS idx_user_backups_original_uuid ON user_backups(original_uuid);

-- Add a comment to explain the purpose
COMMENT ON COLUMN user_backups.original_uuid IS 'Original UUID of the user who was backed up. Preserved even when user_id becomes null after user deletion. Used for accessing storage files.';
