-- Check what tables exist in the database
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if specific tables exist
SELECT 
  'profiles' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') as exists
UNION ALL
SELECT 
  'assets' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assets') as exists
UNION ALL
SELECT 
  'families' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'families') as exists
UNION ALL
SELECT 
  'memory_books' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memory_books') as exists
UNION ALL
SELECT 
  'activity_log' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_log') as exists; 