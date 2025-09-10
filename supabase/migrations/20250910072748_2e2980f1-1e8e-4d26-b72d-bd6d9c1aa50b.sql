-- Enable real-time for key tables
ALTER TABLE public.files REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.financial_statements REPLICA IDENTITY FULL;
ALTER TABLE public.data_issues REPLICA IDENTITY FULL;
ALTER TABLE public.bank_statements REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_statements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.data_issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bank_statements;

-- Create a view for comprehensive file data with related counts
CREATE OR REPLACE VIEW public.file_overview AS
SELECT 
  f.id,
  f.user_id,
  f.file_name,
  f.file_type,
  f.file_size,
  f.file_url,
  f.upload_date,
  f.processing_status,
  f.processing_metadata,
  f.created_at,
  f.updated_at,
  -- Related data counts
  COALESCE(t.transaction_count, 0) as transaction_count,
  COALESCE(t.total_debits, 0) as total_debits,
  COALESCE(t.total_credits, 0) as total_credits,
  COALESCE(fs.statement_count, 0) as statement_count,
  COALESCE(di.issues_count, 0) as issues_count,
  -- Bank statement info
  bs.bank_id,
  bs.result_json as bank_statement_result
FROM public.files f
LEFT JOIN (
  SELECT 
    file_id,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as total_debits,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_credits
  FROM public.transactions 
  GROUP BY file_id
) t ON f.id = t.file_id
LEFT JOIN (
  SELECT 
    file_id,
    COUNT(*) as statement_count
  FROM public.financial_statements 
  GROUP BY file_id
) fs ON f.id = fs.file_id
LEFT JOIN (
  SELECT 
    file_id,
    COUNT(*) as issues_count
  FROM public.data_issues 
  GROUP BY file_id
) di ON f.id = di.file_id
LEFT JOIN public.bank_statements bs ON f.id = bs.id;

-- Grant access to the view
GRANT SELECT ON public.file_overview TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view their own file overview" ON public.file_overview
  FOR SELECT USING (auth.uid() = user_id);