-- Safe RLS update - only enables RLS on tables that exist

-- Enable RLS on assets table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assets') THEN
    ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
    
    -- Assets policies
    DROP POLICY IF EXISTS "Users can manage own assets" ON assets;
    CREATE POLICY "Users can manage own assets" ON assets FOR ALL USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Assets table RLS enabled and policies created';
  ELSE
    RAISE NOTICE 'Assets table does not exist - skipping';
  END IF;
END $$;

-- Enable RLS on memory_books table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memory_books') THEN
    ALTER TABLE memory_books ENABLE ROW LEVEL SECURITY;
    
    -- Memory books policies
    DROP POLICY IF EXISTS "Users can manage own memory books" ON memory_books;
    CREATE POLICY "Users can manage own memory books" ON memory_books FOR ALL USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Memory books table RLS enabled and policies created';
  ELSE
    RAISE NOTICE 'Memory books table does not exist - skipping';
  END IF;
END $$;

-- Enable RLS on activity_log table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_log') THEN
    ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
    
    -- Activity log policies
    DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
    CREATE POLICY "Users can view own activity" ON activity_log FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own activity" ON activity_log;
    CREATE POLICY "Users can insert own activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    RAISE NOTICE 'Activity log table RLS enabled and policies created';
  ELSE
    RAISE NOTICE 'Activity log table does not exist - skipping';
  END IF;
END $$; 