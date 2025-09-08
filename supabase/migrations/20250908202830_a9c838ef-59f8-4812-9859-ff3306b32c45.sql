-- Financial Analysis Engine Database Schema

-- Create files table for tracking uploaded documents
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, excel, image
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processing_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  processing_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing transactions table to include more fields
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS file_id UUID,
ADD COLUMN IF NOT EXISTS reference_number TEXT,
ADD COLUMN IF NOT EXISTS debit NUMERIC,
ADD COLUMN IF NOT EXISTS credit NUMERIC,
ADD COLUMN IF NOT EXISTS balance NUMERIC,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ZAR',
ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_description TEXT,
ADD COLUMN IF NOT EXISTS normalized_description TEXT,
ADD COLUMN IF NOT EXISTS processing_notes TEXT;

-- Create financial_statements table
CREATE TABLE public.financial_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_id UUID,
  statement_type TEXT NOT NULL, -- income_statement, balance_sheet, cash_flow
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  statement_data JSONB NOT NULL,
  ratios JSONB,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ml_tags table for machine learning categorization
CREATE TABLE public.ml_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL,
  tag_type TEXT NOT NULL, -- category, anomaly, trend, recurring
  tag_value TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data_issues table for tracking validation problems
CREATE TABLE public.data_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_id UUID,
  transaction_id UUID,
  issue_type TEXT NOT NULL, -- validation_error, ocr_confidence, duplicate, balance_mismatch
  issue_description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  resolution_status TEXT NOT NULL DEFAULT 'open', -- open, acknowledged, resolved, ignored
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_processing_status ON public.files(processing_status);
CREATE INDEX idx_transactions_file_id ON public.transactions(file_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date);
CREATE INDEX idx_financial_statements_user_type ON public.financial_statements(user_id, statement_type);
CREATE INDEX idx_ml_tags_transaction_id ON public.ml_tags(transaction_id);
CREATE INDEX idx_ml_tags_tag_type ON public.ml_tags(tag_type);
CREATE INDEX idx_data_issues_user_id ON public.data_issues(user_id);
CREATE INDEX idx_data_issues_status ON public.data_issues(resolution_status);

-- Enable Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for files table
CREATE POLICY "Users can view their own files" ON public.files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own files" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON public.files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON public.files
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for financial_statements table
CREATE POLICY "Users can view their own financial statements" ON public.financial_statements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial statements" ON public.financial_statements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial statements" ON public.financial_statements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial statements" ON public.financial_statements
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ml_tags table
CREATE POLICY "Users can view ml_tags for their transactions" ON public.ml_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = ml_tags.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ml_tags for their transactions" ON public.ml_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = ml_tags.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ml_tags for their transactions" ON public.ml_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = ml_tags.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ml_tags for their transactions" ON public.ml_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = ml_tags.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

-- RLS Policies for data_issues table
CREATE POLICY "Users can view their own data issues" ON public.data_issues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data issues" ON public.data_issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data issues" ON public.data_issues
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data issues" ON public.data_issues
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_statements_updated_at
  BEFORE UPDATE ON public.financial_statements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_issues_updated_at
  BEFORE UPDATE ON public.data_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();