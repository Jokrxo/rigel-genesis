
ALTER TABLE public.sales_documents 
ADD COLUMN IF NOT EXISTS converted_from UUID REFERENCES public.sales_documents(id);

-- Update the RPC to handle conversion
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
  p_converted_from UUID DEFAULT NULL
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
  -- Calculate Totals from Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_line_total := (v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric;
    v_subtotal := v_subtotal + v_line_total;
    v_line_tax := v_line_total * ((v_item->>'tax_rate')::numeric / 100);
    v_tax_amount := v_tax_amount + v_line_tax;
  END LOOP;
  
  v_total_amount := v_subtotal + v_tax_amount;

  -- Insert Document Header
  INSERT INTO public.sales_documents (
    user_id, customer_id, document_type, document_number, issue_date, due_date, 
    status, subtotal, tax_amount, total_amount, notes, amount_paid, converted_from
  ) VALUES (
    p_user_id, p_customer_id, p_document_type, p_document_number, p_issue_date, p_due_date,
    p_status,
    v_subtotal, v_tax_amount, v_total_amount, p_notes, 0, p_converted_from
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

  -- Update source document status if converted
  IF p_converted_from IS NOT NULL THEN
    UPDATE public.sales_documents 
    SET status = 'accepted'
    WHERE id = p_converted_from;
  END IF;

  -- Post if requested and is invoice
  IF p_status = 'posted' AND p_document_type = 'invoice' THEN
    PERFORM post_sales_invoice(v_doc_id);
  END IF;

  RETURN jsonb_build_object('id', v_doc_id, 'document_number', p_document_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
