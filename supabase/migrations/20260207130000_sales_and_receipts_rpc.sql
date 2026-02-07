
-- Add amount_paid to sales_documents
ALTER TABLE public.sales_documents ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15,2) DEFAULT 0;

-- Create Receipts Table
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque', 'other')),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts" ON public.receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON public.receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON public.receipts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receipts" ON public.receipts FOR DELETE USING (auth.uid() = user_id);

-- Create Receipt Allocations Table
CREATE TABLE IF NOT EXISTS public.receipt_allocations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.sales_documents(id) ON DELETE CASCADE,
    amount_applied NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.receipt_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own allocations" ON public.receipt_allocations FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_allocations.receipt_id AND receipts.user_id = auth.uid()));
CREATE POLICY "Users can insert own allocations" ON public.receipt_allocations FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_allocations.receipt_id AND receipts.user_id = auth.uid()));
CREATE POLICY "Users can delete own allocations" ON public.receipt_allocations FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_allocations.receipt_id AND receipts.user_id = auth.uid()));


-- RPC: Post Sales Invoice
CREATE OR REPLACE FUNCTION post_sales_invoice(p_invoice_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_invoice RECORD;
  v_journal_id UUID;
  v_ar_account_id UUID;
  v_sales_account_id UUID;
  v_vat_account_id UUID;
BEGIN
  -- 1. Get Invoice
  SELECT * INTO v_invoice FROM public.sales_documents WHERE id = p_invoice_id;
  
  IF v_invoice IS NULL THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;
  
  IF v_invoice.status = 'posted' THEN
    RAISE EXCEPTION 'Invoice already posted';
  END IF;

  -- 2. Get Account IDs (using codes from COA)
  -- Trade Receivables (1200)
  SELECT id INTO v_ar_account_id FROM public.chart_of_accounts WHERE code = '1200' LIMIT 1;
  -- Sales Revenue (4000)
  SELECT id INTO v_sales_account_id FROM public.chart_of_accounts WHERE code = '4000' LIMIT 1;
  -- VAT Output (3200)
  SELECT id INTO v_vat_account_id FROM public.chart_of_accounts WHERE code = '3200' LIMIT 1;

  IF v_ar_account_id IS NULL OR v_sales_account_id IS NULL OR v_vat_account_id IS NULL THEN
    RAISE EXCEPTION 'Required accounts not found in Chart of Accounts';
  END IF;

  -- 3. Create Journal Entry
  INSERT INTO public.journal_entries (
    user_id, date, reference, description, status, type, total_amount, related_document_id, related_document_type
  ) VALUES (
    v_invoice.user_id,
    v_invoice.issue_date,
    v_invoice.document_number,
    'Invoice #' || v_invoice.document_number,
    'posted',
    'standard',
    v_invoice.total_amount,
    v_invoice.id,
    'invoice'
  ) RETURNING id INTO v_journal_id;

  -- 4. Create Journal Lines
  -- Debit AR (Total)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
  VALUES (v_journal_id, v_ar_account_id, 'Invoice ' || v_invoice.document_number, v_invoice.total_amount, 0);

  -- Credit Sales (Subtotal)
  IF v_invoice.subtotal > 0 THEN
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
    VALUES (v_journal_id, v_sales_account_id, 'Sales Revenue', 0, v_invoice.subtotal);
  END IF;

  -- Credit VAT (Tax)
  IF v_invoice.tax_amount > 0 THEN
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
    VALUES (v_journal_id, v_vat_account_id, 'VAT Output', 0, v_invoice.tax_amount);
  END IF;

  -- 5. Update Invoice Status
  UPDATE public.sales_documents
  SET status = 'posted'
  WHERE id = p_invoice_id;

  RETURN jsonb_build_object('success', true, 'journal_id', v_journal_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: Create Sales Invoice V2 (Atomic)
CREATE OR REPLACE FUNCTION create_sales_invoice_v2(
  p_user_id UUID,
  p_customer_id UUID,
  p_document_number TEXT,
  p_issue_date DATE,
  p_due_date DATE,
  p_items JSONB, -- Array of objects
  p_notes TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'draft'
) RETURNS JSONB AS $$
DECLARE
  v_invoice_id UUID;
  v_subtotal NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_line_total NUMERIC;
  v_line_tax NUMERIC;
BEGIN
  -- 1. Calculate Totals from Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_line_total := (v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric;
    v_subtotal := v_subtotal + v_line_total;
    -- Assuming tax_rate is percentage e.g. 15
    v_line_tax := v_line_total * ((v_item->>'tax_rate')::numeric / 100);
    v_tax_amount := v_tax_amount + v_line_tax;
  END LOOP;
  
  v_total_amount := v_subtotal + v_tax_amount;

  -- 2. Insert Invoice Header
  INSERT INTO public.sales_documents (
    user_id, customer_id, document_type, document_number, issue_date, due_date, 
    status, subtotal, tax_amount, total_amount, notes, amount_paid
  ) VALUES (
    p_user_id, p_customer_id, 'invoice', p_document_number, p_issue_date, p_due_date,
    'draft', -- Always start as draft, then post if needed
    v_subtotal, v_tax_amount, v_total_amount, p_notes, 0
  ) RETURNING id INTO v_invoice_id;

  -- 3. Insert Items
  INSERT INTO public.sales_document_items (
    document_id, description, quantity, unit_price, tax_rate, line_total
  )
  SELECT 
    v_invoice_id,
    item->>'description',
    (item->>'quantity')::numeric,
    (item->>'unit_price')::numeric,
    (item->>'tax_rate')::numeric,
    ((item->>'quantity')::numeric * (item->>'unit_price')::numeric) -- Line total (excl tax usually stored, but let's be consistent)
  FROM jsonb_array_elements(p_items) AS item;

  -- 4. Post if requested
  IF p_status = 'posted' THEN
    PERFORM post_sales_invoice(v_invoice_id);
  END IF;

  RETURN jsonb_build_object('id', v_invoice_id, 'document_number', p_document_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: Create Receipt V2 (Atomic)
CREATE OR REPLACE FUNCTION create_receipt_v2(
  p_user_id UUID,
  p_customer_id UUID,
  p_receipt_number TEXT,
  p_receipt_date DATE,
  p_amount NUMERIC,
  p_payment_method TEXT,
  p_reference TEXT,
  p_allocations JSONB, -- Array of {invoice_id, amount}
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_receipt_id UUID;
  v_journal_id UUID;
  v_bank_account_id UUID;
  v_ar_account_id UUID;
  v_allocation JSONB;
  v_invoice_id UUID;
  v_alloc_amount NUMERIC;
BEGIN
  -- 1. Insert Receipt
  INSERT INTO public.receipts (
    user_id, customer_id, receipt_number, receipt_date, amount, payment_method, reference, notes
  ) VALUES (
    p_user_id, p_customer_id, p_receipt_number, p_receipt_date, p_amount, p_payment_method, p_reference, p_notes
  ) RETURNING id INTO v_receipt_id;

  -- 2. Process Allocations
  IF p_allocations IS NOT NULL THEN
    FOR v_allocation IN SELECT * FROM jsonb_array_elements(p_allocations)
    LOOP
      v_invoice_id := (v_allocation->>'invoice_id')::uuid;
      v_alloc_amount := (v_allocation->>'amount')::numeric;

      -- Insert Allocation Record
      INSERT INTO public.receipt_allocations (receipt_id, invoice_id, amount_applied)
      VALUES (v_receipt_id, v_invoice_id, v_alloc_amount);

      -- Update Invoice Paid Amount
      UPDATE public.sales_documents
      SET 
        amount_paid = COALESCE(amount_paid, 0) + v_alloc_amount,
        status = CASE 
          WHEN (COALESCE(amount_paid, 0) + v_alloc_amount) >= total_amount THEN 'paid'
          ELSE 'partial'
        END
      WHERE id = v_invoice_id;
    END LOOP;
  END IF;

  -- 3. Create Journal Entry (Cash Receipt)
  -- Dr Bank (1310), Cr AR (1200)
  
  SELECT id INTO v_bank_account_id FROM public.chart_of_accounts WHERE code = '1310' LIMIT 1;
  SELECT id INTO v_ar_account_id FROM public.chart_of_accounts WHERE code = '1200' LIMIT 1;

  IF v_bank_account_id IS NULL OR v_ar_account_id IS NULL THEN
     -- If accounts missing, maybe don't fail the whole receipt? 
     -- But for consistency, we should fail or auto-create.
     -- Let's raise notice and skip journal if accounts missing, or fail.
     -- "Production Ready" means we should fail if accounting is broken.
     RAISE EXCEPTION 'Bank or AR account not found in Chart of Accounts';
  END IF;

  INSERT INTO public.journal_entries (
    user_id, date, reference, description, status, type, total_amount, related_document_id, related_document_type
  ) VALUES (
    p_user_id,
    p_receipt_date,
    p_receipt_number,
    'Receipt #' || p_receipt_number || ' - ' || p_reference,
    'posted',
    'standard',
    p_amount,
    v_receipt_id,
    'receipt'
  ) RETURNING id INTO v_journal_id;

  -- Dr Bank
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
  VALUES (v_journal_id, v_bank_account_id, 'Receipt from Customer', p_amount, 0);

  -- Cr AR
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
  VALUES (v_journal_id, v_ar_account_id, 'Payment Received', 0, p_amount);

  RETURN jsonb_build_object('id', v_receipt_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
