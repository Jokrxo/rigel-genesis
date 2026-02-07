-- Create sales_documents table
CREATE TABLE IF NOT EXISTS public.sales_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  document_type TEXT NOT NULL, -- quotation, invoice, credit_note, sales_order
  document_date DATE NOT NULL,
  due_date DATE,
  total_amount NUMERIC(15,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  converted_from UUID REFERENCES public.sales_documents(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sales_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage company sales documents" ON public.sales_documents;
CREATE POLICY "Users can manage company sales documents" ON public.sales_documents FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create sales_document_items table
CREATE TABLE IF NOT EXISTS public.sales_document_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_document_id UUID NOT NULL REFERENCES public.sales_documents(id) ON DELETE CASCADE,
  description TEXT,
  quantity NUMERIC(15,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 15,
  total_amount NUMERIC(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sales_document_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage company sales document items" ON public.sales_document_items;
CREATE POLICY "Users can manage company sales document items" ON public.sales_document_items FOR ALL
  USING (sales_document_id IN (SELECT id FROM public.sales_documents WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())))
  WITH CHECK (sales_document_id IN (SELECT id FROM public.sales_documents WHERE company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())));


-- Create account_balances View
CREATE OR REPLACE VIEW public.account_balances AS
SELECT 
    l.account_id,
    c.code,
    c.name,
    c.type,
    c.subtype,
    c.company_id,
    SUM(CASE 
        WHEN c.type IN ('asset', 'expense') THEN l.debit - l.credit 
        ELSE l.credit - l.debit 
    END) as current_balance
FROM public.journal_entry_lines l
JOIN public.journal_entries je ON l.journal_entry_id = je.id
JOIN public.chart_of_accounts c ON l.account_id = c.id
WHERE je.status = 'posted'
GROUP BY l.account_id, c.code, c.name, c.type, c.subtype, c.company_id;

-- Grant access to view
GRANT SELECT ON public.account_balances TO authenticated;
GRANT SELECT ON public.account_balances TO service_role;


-- Create RPC for atomic sales document creation
CREATE OR REPLACE FUNCTION public.create_sales_document_v2(
  p_user_id UUID,
  p_customer_id UUID,
  p_document_type TEXT,
  p_document_number TEXT,
  p_issue_date DATE,
  p_due_date DATE,
  p_items JSONB,
  p_notes TEXT,
  p_status TEXT,
  p_converted_from UUID,
  p_company_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_document_id UUID;
  v_total_amount NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_item JSONB;
  v_item_total NUMERIC;
  v_item_tax NUMERIC;
BEGIN
  -- Insert Document
  INSERT INTO public.sales_documents (
    company_id, customer_id, document_number, document_type, 
    document_date, due_date, status, notes, converted_from, user_id
  ) VALUES (
    p_company_id, p_customer_id, p_document_number, p_document_type,
    p_issue_date, p_due_date, p_status, p_notes, p_converted_from, p_user_id
  ) RETURNING id INTO v_document_id;

  -- Process Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_total := (v_item->>'quantity')::NUMERIC * (v_item->>'unit_price')::NUMERIC;
    v_item_tax := v_item_total * ((v_item->>'tax_rate')::NUMERIC / 100);
    
    v_total_amount := v_total_amount + v_item_total;
    v_tax_amount := v_tax_amount + v_item_tax;

    INSERT INTO public.sales_document_items (
      sales_document_id, description, quantity, unit_price, tax_rate
    ) VALUES (
      v_document_id,
      v_item->>'description',
      (v_item->>'quantity')::NUMERIC,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'tax_rate')::NUMERIC
    );
  END LOOP;

  -- Update Totals
  UPDATE public.sales_documents
  SET total_amount = v_total_amount + v_tax_amount,
      tax_amount = v_tax_amount
  WHERE id = v_document_id;

  RETURN jsonb_build_object('id', v_document_id);
END;
$$;
