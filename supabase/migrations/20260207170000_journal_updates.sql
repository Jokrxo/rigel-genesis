
-- Add company_id to journal_entries
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Update RLS for journal_entries
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;

CREATE POLICY "Users can manage company journal entries" ON public.journal_entries FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Ensure journal_entry_lines RLS allows access if parent is accessible
-- (Usually lines inherit access if we query via join, but for direct RLS:)
DROP POLICY IF EXISTS "Users can view own journal lines" ON public.journal_entry_lines;
DROP POLICY IF EXISTS "Users can insert own journal lines" ON public.journal_entry_lines;

CREATE POLICY "Users can manage company journal lines" ON public.journal_entry_lines FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.journal_entries je
  WHERE je.id = journal_entry_lines.journal_entry_id
  AND je.company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.journal_entries je
  WHERE je.id = journal_entry_lines.journal_entry_id
  AND je.company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
));

-- Update account_balances view to be security invoker
-- This ensures that when a user queries it, RLS on underlying tables (journal_entries) is applied
DROP VIEW IF EXISTS public.account_balances;
CREATE OR REPLACE VIEW public.account_balances WITH (security_invoker = on) AS
SELECT 
    a.id as account_id,
    a.code,
    a.name,
    a.type,
    a.subtype,
    COALESCE(SUM(l.debit), 0) as total_debit,
    COALESCE(SUM(l.credit), 0) as total_credit,
    CASE 
        WHEN a.type IN ('asset', 'expense') THEN COALESCE(SUM(l.debit), 0) - COALESCE(SUM(l.credit), 0)
        ELSE COALESCE(SUM(l.credit), 0) - COALESCE(SUM(l.debit), 0)
    END as current_balance
FROM 
    public.chart_of_accounts a
LEFT JOIN 
    public.journal_entry_lines l ON a.id = l.account_id
LEFT JOIN
    public.journal_entries je ON l.journal_entry_id = je.id AND je.status = 'posted'
GROUP BY 
    a.id, a.code, a.name, a.type, a.subtype;

-- Create RPC for atomic journal entry creation
CREATE OR REPLACE FUNCTION create_journal_entry(
  p_user_id UUID,
  p_company_id UUID,
  p_date DATE,
  p_reference TEXT,
  p_description TEXT,
  p_type TEXT,
  p_lines JSONB,
  p_status TEXT DEFAULT 'draft'
) RETURNS JSONB AS $$
DECLARE
  v_entry_id UUID;
  v_line JSONB;
  v_total_debit NUMERIC := 0;
  v_total_credit NUMERIC := 0;
BEGIN
  -- Insert entry
  INSERT INTO public.journal_entries (
    user_id, company_id, date, reference, description, type, status, created_at, updated_at
  ) VALUES (
    p_user_id, p_company_id, p_date, p_reference, p_description, p_type, p_status, now(), now()
  ) RETURNING id INTO v_entry_id;

  -- Insert lines
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    INSERT INTO public.journal_entry_lines (
      journal_entry_id, account_id, description, debit, credit
    ) VALUES (
      v_entry_id,
      (v_line->>'accountId')::UUID, 
      (v_line->>'description')::TEXT,
      (v_line->>'debit')::NUMERIC,
      (v_line->>'credit')::NUMERIC
    );
    
    v_total_debit := v_total_debit + (v_line->>'debit')::NUMERIC;
    v_total_credit := v_total_credit + (v_line->>'credit')::NUMERIC;
  END LOOP;
  
  -- Update totals
  UPDATE public.journal_entries
  SET total_amount = GREATEST(v_total_debit, v_total_credit)
  WHERE id = v_entry_id;

  RETURN jsonb_build_object('id', v_entry_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC for atomic journal entry update
CREATE OR REPLACE FUNCTION update_journal_entry(
  p_entry_id UUID,
  p_user_id UUID,
  p_date DATE,
  p_reference TEXT,
  p_description TEXT,
  p_type TEXT,
  p_lines JSONB,
  p_status TEXT DEFAULT 'draft'
) RETURNS JSONB AS $$
DECLARE
  v_line JSONB;
  v_total_debit NUMERIC := 0;
  v_total_credit NUMERIC := 0;
  v_company_id UUID;
BEGIN
  -- Check permission and get company_id
  SELECT company_id INTO v_company_id FROM public.journal_entries WHERE id = p_entry_id;
  
  -- Validate user has access to this company
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = p_user_id AND company_id = v_company_id
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Update entry
  UPDATE public.journal_entries
  SET 
    date = p_date,
    reference = p_reference,
    description = p_description,
    type = p_type,
    status = p_status,
    updated_at = now()
  WHERE id = p_entry_id;

  -- Delete existing lines
  DELETE FROM public.journal_entry_lines WHERE journal_entry_id = p_entry_id;

  -- Insert new lines
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    INSERT INTO public.journal_entry_lines (
      journal_entry_id, account_id, description, debit, credit
    ) VALUES (
      p_entry_id,
      (v_line->>'accountId')::UUID, 
      (v_line->>'description')::TEXT,
      (v_line->>'debit')::NUMERIC,
      (v_line->>'credit')::NUMERIC
    );
    
    v_total_debit := v_total_debit + (v_line->>'debit')::NUMERIC;
    v_total_credit := v_total_credit + (v_line->>'credit')::NUMERIC;
  END LOOP;
  
  -- Update totals
  UPDATE public.journal_entries
  SET total_amount = GREATEST(v_total_debit, v_total_credit)
  WHERE id = p_entry_id;

  RETURN jsonb_build_object('id', p_entry_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
