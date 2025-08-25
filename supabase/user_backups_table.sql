-- User backups table for storing complete user data backups
create table if not exists user_backups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  backup_data jsonb not null,
  created_by uuid not null,
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false
);

-- Index for efficient queries
create index if not exists idx_user_backups_user_id on user_backups(user_id);
create index if not exists idx_user_backups_created_by on user_backups(created_by);
create index if not exists idx_user_backups_created_at on user_backups(created_at);
create index if not exists idx_user_backups_status on user_backups(status);

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_user_backups_user_id'
      AND table_name = 'user_backups'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE user_backups
      ADD CONSTRAINT fk_user_backups_user_id
      FOREIGN KEY (user_id) REFERENCES profiles(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_user_backups_created_by'
      AND table_name = 'user_backups'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE user_backups
      ADD CONSTRAINT fk_user_backups_created_by
      FOREIGN KEY (created_by) REFERENCES profiles(user_id);
  END IF;
END $$;

-- Create trigger for updated_at
drop trigger if exists update_user_backups_updated_at on user_backups;
create trigger update_user_backups_updated_at before update on user_backups for each row execute function update_updated_at_column();

-- Enable RLS
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_backups (admin only)
DROP POLICY IF EXISTS "Admins can manage user backups" ON user_backups;
CREATE POLICY "Admins can manage user backups" ON user_backups 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );
