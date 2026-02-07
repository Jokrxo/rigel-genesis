-- Add columns to transactions to support UI requirements
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS amount NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Create Transaction Type Mappings Table
CREATE TABLE IF NOT EXISTS public.transaction_type_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code TEXT NOT NULL UNIQUE, -- 'income', 'expense'
    description TEXT,
    debit_account_code TEXT,
    credit_account_code TEXT,
    is_active BOOLEAN DEFAULT true,
    vat_applicable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for mappings
ALTER TABLE public.transaction_type_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.transaction_type_mappings FOR SELECT USING (true);

-- Seed Mappings
INSERT INTO public.transaction_type_mappings (type_code, description, debit_account_code, credit_account_code, vat_applicable) VALUES
('income', 'General Income', '1310', '4000', true),
('expense', 'General Expense', '6110', '1310', true)
ON CONFLICT (type_code) DO NOTHING;

-- Create RPC for atomic transaction creation
CREATE OR REPLACE FUNCTION create_transaction_v2(
  p_user_id UUID,
  p_date DATE,
  p_amount NUMERIC,
  p_description TEXT,
  p_type TEXT, -- 'income', 'expense'
  p_category TEXT, -- Account Name or Code
  p_vat_inclusive BOOLEAN DEFAULT true
) RETURNS JSONB AS $$
DECLARE
  v_transaction_id UUID;
  v_journal_id UUID;
  v_bank_account_id TEXT;
  v_target_account_id TEXT;
  v_vat_account_id TEXT;
  v_vat_amount NUMERIC := 0;
  v_net_amount NUMERIC;
BEGIN
  -- 1. Insert into transactions
  INSERT INTO public.transactions (user_id, transaction_date, description, amount, type, category, created_at)
  VALUES (p_user_id, p_date, p_description, p_amount, p_type, p_category, now())
  RETURNING id INTO v_transaction_id;

  -- 2. Determine Accounts (store as TEXT to match journal_entry_lines schema)
  -- Find Bank Account (1310)
  SELECT id::text INTO v_bank_account_id FROM public.chart_of_accounts WHERE code = '1310' LIMIT 1;
  
  -- Find Target Account (Category)
  SELECT id::text INTO v_target_account_id FROM public.chart_of_accounts 
  WHERE name = p_category OR code = p_category 
  LIMIT 1;
  
  -- Fallback if target not found
  IF v_target_account_id IS NULL THEN
    IF p_type = 'income' THEN
       SELECT id::text INTO v_target_account_id FROM public.chart_of_accounts WHERE code = '4200' LIMIT 1; -- Other Income
    ELSE
       SELECT id::text INTO v_target_account_id FROM public.chart_of_accounts WHERE code = '6110' LIMIT 1; -- Office Expenses
    END IF;
  END IF;

  -- Ensure we have accounts
  IF v_bank_account_id IS NULL OR v_target_account_id IS NULL THEN
     RAISE EXCEPTION 'Critical accounts not found in Chart of Accounts';
  END IF;

  -- 3. Calculate VAT (15%)
  IF p_vat_inclusive THEN
    v_net_amount := ROUND(p_amount / 1.15, 2);
    v_vat_amount := p_amount - v_net_amount;
  ELSE
    v_net_amount := p_amount;
    v_vat_amount := ROUND(p_amount * 0.15, 2);
  END IF;

  -- 4. Create Journal Entry
  INSERT INTO public.journal_entries (user_id, date, description, type, total_amount, reference, status)
  VALUES (p_user_id, p_date, p_description, 'standard', p_amount, 'TRX-' || v_transaction_id, 'posted')
  RETURNING id INTO v_journal_id;

  -- 5. Create Ledger Postings
  IF p_type = 'income' THEN
     -- Dr Bank (Full Amount)
     INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
     VALUES (v_journal_id, v_bank_account_id, 'Payment Received', p_amount, 0);
     
     -- Cr Revenue (Net)
     INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
     VALUES (v_journal_id, v_target_account_id, p_description, 0, v_net_amount);
     
     -- Cr VAT Output (VAT)
     SELECT id::text INTO v_vat_account_id FROM public.chart_of_accounts WHERE code = '3200' LIMIT 1; -- VAT Payable
     IF v_vat_account_id IS NOT NULL AND v_vat_amount > 0 THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
        VALUES (v_journal_id, v_vat_account_id, 'VAT Output (15%)', 0, v_vat_amount);
     END IF;
     
  ELSIF p_type = 'expense' THEN
     -- Cr Bank (Full Amount)
     INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
     VALUES (v_journal_id, v_bank_account_id, 'Payment Sent', 0, p_amount);
     
     -- Dr Expense (Net)
     INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
     VALUES (v_journal_id, v_target_account_id, p_description, v_net_amount, 0);
     
     -- Dr VAT Input (VAT)
     SELECT id::text INTO v_vat_account_id FROM public.chart_of_accounts WHERE code = '1400' LIMIT 1; -- VAT Input
     IF v_vat_account_id IS NOT NULL AND v_vat_amount > 0 THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
        VALUES (v_journal_id, v_vat_account_id, 'VAT Input (15%)', v_vat_amount, 0);
     END IF;
  END IF;

  RETURN jsonb_build_object('transaction_id', v_transaction_id, 'journal_id', v_journal_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
