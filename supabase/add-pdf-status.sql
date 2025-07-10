-- Add PDF status tracking table
create table if not exists pdf_status (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null,
  user_id uuid not null,
  status text not null,
  progress integer default 0 check (progress between 0 and 100),
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(book_id)
);

-- Create indexes for better performance
create index if not exists idx_pdf_status_book_id on pdf_status(book_id);
create index if not exists idx_pdf_status_user_id on pdf_status(user_id);

-- Create updated_at trigger for pdf_status
drop trigger if exists update_pdf_status_updated_at on pdf_status;
create trigger update_pdf_status_updated_at before update on pdf_status for each row execute function update_updated_at_column();

-- Enable RLS on pdf_status table
ALTER TABLE pdf_status ENABLE ROW LEVEL SECURITY;

-- PDF status policies
DROP POLICY IF EXISTS "Users can manage own pdf status" ON pdf_status;
CREATE POLICY "Users can manage own pdf status" ON pdf_status FOR ALL USING (auth.uid() = user_id); 