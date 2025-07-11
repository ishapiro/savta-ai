-- Check what columns exist in memory_books table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'memory_books'
ORDER BY ordinal_position;

-- Also check if the table exists
SELECT 
  'memory_books' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memory_books') as exists; 