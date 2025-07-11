-- Fix Memory Books Performance Issues
-- Run this in your Supabase SQL Editor

-- 1. Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memory_books_user_id ON memory_books(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_books_deleted ON memory_books(deleted);
CREATE INDEX IF NOT EXISTS idx_memory_books_user_id_deleted ON memory_books(user_id, deleted);
CREATE INDEX IF NOT EXISTS idx_memory_books_status ON memory_books(status);
CREATE INDEX IF NOT EXISTS idx_memory_books_created_at ON memory_books(created_at);

-- 2. Add indexes for pdf_status table as well
CREATE INDEX IF NOT EXISTS idx_pdf_status_user_id ON pdf_status(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_status_book_id ON pdf_status(book_id);
CREATE INDEX IF NOT EXISTS idx_pdf_status_user_id_book_id ON pdf_status(user_id, book_id);

-- 3. Vacuum and analyze tables to clean up bloat and update statistics
VACUUM ANALYZE memory_books;
VACUUM ANALYZE pdf_status;

-- 4. Check for any long-running queries or locks
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  now() - query_start as duration,
  query
FROM pg_stat_activity 
WHERE state != 'idle' 
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;

-- 5. Check table sizes and bloat
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE tablename = 'memory_books';

-- 6. Test the query with EXPLAIN to see what's happening
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM memory_books 
WHERE user_id = '9429abe0-9af6-442a-a1de-b74537badbcf' 
  AND deleted = false;

-- 7. Check if RLS is causing issues by temporarily disabling it
-- (Only run this if you're an admin and want to test)
-- ALTER TABLE memory_books DISABLE ROW LEVEL SECURITY;
-- SELECT * FROM memory_books WHERE user_id = '9429abe0-9af6-442a-a1de-b74537badbcf' AND deleted = false;
-- ALTER TABLE memory_books ENABLE ROW LEVEL SECURITY;

-- 8. Check for any triggers that might be slowing things down
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'memory_books';

-- 9. Check if there are any foreign key constraints causing issues
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'memory_books'; 