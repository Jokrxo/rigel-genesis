
-- Add company_id to sales_documents
ALTER TABLE public.sales_documents 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add company_id to receipts
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Update RLS for sales_documents
DROP POLICY IF EXISTS "Users can view their own sales documents" ON public.sales_documents;
CREATE POLICY "Users can manage company sales documents" ON public.sales_documents FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Update RLS for receipts
DROP POLICY IF EXISTS "Users can view own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can insert own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can update own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can delete own receipts" ON public.receipts;

CREATE POLICY "Users can manage company receipts" ON public.receipts FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Update RPC create_sales_document_v2
CREATE OR REPLACE FUNCTION create_sales_document_v2(
  p_user_id UUID,
  p_customer_id UUID,
  p_document_type TEXT,
  p_document_number TEXT,
  p_issue_date DATE,
  p_due_date DATE,
  p_items JSONB,
  p_notes TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'draft',
  p_converted_from UUID DEFAULT NULL,
  p_company_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_doc_id UUID;
  v_subtotal NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_line_total NUMERIC;
  v_line_tax NUMERIC;
BEGIN
  -- Calculate Totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_line_total := (v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric;
    v_subtotal := v_subtotal + v_line_total;
    v_line_tax := v_line_total * ((v_item->>'tax_rate')::numeric / 100);
    v_tax_amount := v_tax_amount + v_line_tax;
  END LOOP;
  
  v_total_amount := v_subtotal + v_tax_amount;

  -- Insert Document
  INSERT INTO public.sales_documents (
    user_id, customer_id, document_type, document_number, issue_date, due_date, 
    status, subtotal, tax_amount, total_amount, notes, amount_paid, converted_from, company_id
  ) VALUES (
    p_user_id, p_customer_id, p_document_type, p_document_number, p_issue_date, p_due_date,
    p_status,
    v_subtotal, v_tax_amount, v_total_amount, p_notes, 0, p_converted_from, p_company_id
  ) RETURNING id INTO v_doc_id;

  -- Insert Items
  INSERT INTO public.sales_document_items (
    document_id, description, quantity, unit_price, tax_rate, line_total
  )
  SELECT 
    v_doc_id,
    item->>'description',
    (item->>'quantity')::numeric,
    (item->>'unit_price')::numeric,
    (item->>'tax_rate')::numeric,
    ((item->>'quantity')::numeric * (item->>'unit_price')::numeric)
  FROM jsonb_array_elements(p_items) AS item;

  -- Update source document
  IF p_converted_from IS NOT NULL THEN
    UPDATE public.sales_documents 
    SET status = 'accepted'
    WHERE id = p_converted_from;
  END IF;

  RETURN jsonb_build_object('id', v_doc_id, 'document_number', p_document_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RPC create_receipt_v2
CREATE OR REPLACE FUNCTION create_receipt_v2(
  p_user_id UUID,
  p_customer_id UUID,
  p_receipt_date DATE,
  p_amount NUMERIC,
  p_payment_method TEXT,
  p_reference TEXT,
  p_notes TEXT,
  p_allocations JSONB,
  p_company_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_receipt_id UUID;
  v_allocation JSONB;
  v_receipt_number TEXT;
BEGIN
  -- Generate receipt number (simple for now)
  v_receipt_number := 'REC-' || to_char(now(), 'YYYYMMDD') || '-' || substring(md5(random()::text) from 1 for 4);

  INSERT INTO public.receipts (
    user_id, customer_id, receipt_date, amount, payment_method, reference, notes, receipt_number, company_id
  ) VALUES (
    p_user_id, p_customer_id, p_receipt_date, p_amount, p_payment_method, p_reference, p_notes, v_receipt_number, p_company_id
  ) RETURNING id INTO v_receipt_id;

  -- Process Allocations
  FOR v_allocation IN SELECT * FROM jsonb_array_elements(p_allocations)
  LOOP
    INSERT INTO public.receipt_allocations (
      receipt_id, invoice_id, amount_applied
    ) VALUES (
      v_receipt_id,
      (v_allocation->>'invoice_id')::uuid,
      (v_allocation->>'amount_applied')::numeric
    );

    -- Update Invoice amount_paid
    UPDATE public.sales_documents
    SET amount_paid = amount_paid + (v_allocation->>'amount_applied')::numeric,
        status = CASE 
          WHEN amount_paid + (v_allocation->>'amount_applied')::numeric >= total_amount THEN 'paid'
          ELSE 'partial'
        END
    WHERE id = (v_allocation->>'invoice_id')::uuid;
  END LOOP;

  RETURN jsonb_build_object('id', v_receipt_id, 'receipt_number', v_receipt_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
