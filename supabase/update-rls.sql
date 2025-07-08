-- Update RLS policies for missing tables
-- Run this after the main schema.sql

-- Enable RLS on missing tables
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Assets policies
DROP POLICY IF EXISTS "Users can manage own assets" ON assets;
CREATE POLICY "Users can manage own assets" ON assets FOR ALL USING (auth.uid() = user_id);

-- Memory books policies
DROP POLICY IF EXISTS "Users can manage own memory books" ON memory_books;
CREATE POLICY "Users can manage own memory books" ON memory_books FOR ALL USING (auth.uid() = user_id);

-- Activity log policies
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
CREATE POLICY "Users can view own activity" ON activity_log FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity" ON activity_log;
CREATE POLICY "Users can insert own activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id); 