-- Add foreign key from memory_books.user_id to profiles.user_id (safe for rerun)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_memory_books_user_id'
      AND table_name = 'memory_books'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE memory_books
      ADD CONSTRAINT fk_memory_books_user_id
      FOREIGN KEY (user_id) REFERENCES profiles(user_id);
  END IF;
END $$;

-- Add Themes table to Supabase
create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  preview_image_url text,
  is_active boolean default true,
  background_color text,
  background_opacity integer,
  header_font text,
  body_font text,
  signature_font text,
  header_font_color text,
  body_font_color text,
  signature_font_color text,
  layout_config jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false
);

create index if not exists idx_themes_name on themes(name);
create index if not exists idx_themes_is_active on themes(is_active);

drop trigger if exists update_themes_updated_at on themes;
create trigger update_themes_updated_at before update on themes for each row execute function update_updated_at_column(); 