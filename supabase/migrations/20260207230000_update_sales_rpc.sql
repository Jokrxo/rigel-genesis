CREATE OR REPLACE FUNCTION update_sales_document_v2(
  p_document_id UUID,
  p_user_id UUID,
  p_customer_id UUID,
  p_issue_date DATE,
  p_due_date DATE,
  p_items JSONB,
  p_notes TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'draft',
  p_company_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_subtotal NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_line_total NUMERIC;
  v_line_tax NUMERIC;
BEGIN
  -- Verify ownership/company access
  IF NOT EXISTS (
    SELECT 1 FROM public.sales_documents 
    WHERE id = p_document_id 
    AND (company_id = p_company_id OR (company_id IS NULL AND p_company_id IS NULL))
  ) THEN
    RAISE EXCEPTION 'Document not found or access denied';
  END IF;

  -- Calculate Totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_line_total := (v_item->>'quantity')::numeric * (v_item->>'unit_price')::numeric;
    v_subtotal := v_subtotal + v_line_total;
    v_line_tax := v_line_total * ((v_item->>'tax_rate')::numeric / 100);
    v_tax_amount := v_tax_amount + v_line_tax;
  END LOOP;
  
  v_total_amount := v_subtotal + v_tax_amount;

  -- Update Document Header
  UPDATE public.sales_documents SET
    customer_id = p_customer_id,
    issue_date = p_issue_date,
    due_date = p_due_date,
    status = p_status,
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total_amount = v_total_amount,
    notes = p_notes,
    updated_at = now()
  WHERE id = p_document_id;

  -- Delete existing items
  DELETE FROM public.sales_document_items WHERE document_id = p_document_id;

  -- Insert New Items
  INSERT INTO public.sales_document_items (
    document_id, description, quantity, unit_price, tax_rate, line_total
  )
  SELECT 
    p_document_id,
    item->>'description',
    (item->>'quantity')::numeric,
    (item->>'unit_price')::numeric,
    (item->>'tax_rate')::numeric,
    ((item->>'quantity')::numeric * (item->>'unit_price')::numeric)
  FROM jsonb_array_elements(p_items) AS item;

  RETURN jsonb_build_object('id', p_document_id, 'status', 'success');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
