-- Create files table for statement processing
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT,
  file_size INTEGER,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_metadata JSONB,
  bank_id UUID,
  upload_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own files" ON public.files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own files" ON public.files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own files" ON public.files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON public.files FOR DELETE USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  debit NUMERIC(15,2) DEFAULT 0,
  credit NUMERIC(15,2) DEFAULT 0,
  balance NUMERIC(15,2),
  reference TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Create financial_statements table
CREATE TABLE public.financial_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
  statement_type TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  statement_data JSONB,
  ratios JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.financial_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own statements" ON public.financial_statements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own statements" ON public.financial_statements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own statements" ON public.financial_statements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own statements" ON public.financial_statements FOR DELETE USING (auth.uid() = user_id);

-- Create bank_statements table
CREATE TABLE public.bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  statement_date DATE,
  opening_balance NUMERIC(15,2),
  closing_balance NUMERIC(15,2),
  file_id UUID REFERENCES public.files(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bank statements" ON public.bank_statements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank statements" ON public.bank_statements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank statements" ON public.bank_statements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank statements" ON public.bank_statements FOR DELETE USING (auth.uid() = user_id);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  vat_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'South Africa',
  payment_terms INTEGER DEFAULT 30,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_branch_code TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own suppliers" ON public.suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suppliers" ON public.suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own suppliers" ON public.suppliers FOR DELETE USING (auth.uid() = user_id);

-- Create sales_documents table (renamed from documents to match existing code)
CREATE TABLE public.sales_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'quotation', 'credit_note')),
  document_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  valid_until DATE,
  subtotal NUMERIC(15,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled', 'overdue', 'accepted', 'rejected', 'void')),
  terms_and_conditions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.sales_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sales docs" ON public.sales_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sales docs" ON public.sales_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sales docs" ON public.sales_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales docs" ON public.sales_documents FOR DELETE USING (auth.uid() = user_id);

-- Create sales_document_items table
CREATE TABLE public.sales_document_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.sales_documents(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT,
  quantity NUMERIC(15,4) DEFAULT 1,
  unit_price NUMERIC(15,2) DEFAULT 0,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 15,
  line_total NUMERIC(15,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.sales_document_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sales items" ON public.sales_document_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.sales_documents WHERE sales_documents.id = sales_document_items.document_id AND sales_documents.user_id = auth.uid()));
CREATE POLICY "Users can insert own sales items" ON public.sales_document_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.sales_documents WHERE sales_documents.id = sales_document_items.document_id AND sales_documents.user_id = auth.uid()));
CREATE POLICY "Users can update own sales items" ON public.sales_document_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.sales_documents WHERE sales_documents.id = sales_document_items.document_id AND sales_documents.user_id = auth.uid()));
CREATE POLICY "Users can delete own sales items" ON public.sales_document_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.sales_documents WHERE sales_documents.id = sales_document_items.document_id AND sales_documents.user_id = auth.uid()));

-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference TEXT,
  description TEXT,
  total_debit NUMERIC(15,2) DEFAULT 0,
  total_credit NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Create journal_entry_lines table
CREATE TABLE public.journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE NOT NULL,
  account_id TEXT NOT NULL,
  description TEXT,
  debit NUMERIC(15,2) DEFAULT 0,
  credit NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own journal lines" ON public.journal_entry_lines FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));
CREATE POLICY "Users can insert own journal lines" ON public.journal_entry_lines FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));
CREATE POLICY "Users can update own journal lines" ON public.journal_entry_lines FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));
CREATE POLICY "Users can delete own journal lines" ON public.journal_entry_lines FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));

-- Add theme column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system';

-- Create function for file overview (mock data until full implementation)
CREATE OR REPLACE FUNCTION public.get_file_overview()
RETURNS TABLE (
  id UUID,
  file_name TEXT,
  file_type TEXT,
  file_url TEXT,
  processing_status TEXT,
  upload_date TIMESTAMPTZ,
  processing_metadata JSONB,
  transaction_count BIGINT,
  total_debits NUMERIC,
  total_credits NUMERIC,
  statement_count BIGINT,
  issues_count BIGINT,
  bank_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.file_name,
    f.file_type,
    f.file_url,
    f.processing_status,
    f.upload_date,
    f.processing_metadata,
    COALESCE((SELECT COUNT(*) FROM transactions t WHERE t.file_id = f.id), 0) as transaction_count,
    COALESCE((SELECT SUM(debit) FROM transactions t WHERE t.file_id = f.id), 0) as total_debits,
    COALESCE((SELECT SUM(credit) FROM transactions t WHERE t.file_id = f.id), 0) as total_credits,
    COALESCE((SELECT COUNT(*) FROM financial_statements fs WHERE fs.file_id = f.id), 0) as statement_count,
    COALESCE((SELECT COUNT(*) FROM data_issues di WHERE di.file_id = f.id), 0) as issues_count,
    f.bank_id
  FROM files f
  WHERE f.user_id = auth.uid()
  ORDER BY f.upload_date DESC;
END;
$$;