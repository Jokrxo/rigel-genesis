
-- Add company_id to chart_of_accounts
ALTER TABLE public.chart_of_accounts
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Drop existing unique constraint on code if it exists (it was global)
ALTER TABLE public.chart_of_accounts DROP CONSTRAINT IF EXISTS chart_of_accounts_code_key;

-- Create new unique index: code unique per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_coa_code_company ON public.chart_of_accounts (code, company_id);

-- Update RLS
DROP POLICY IF EXISTS "Authenticated users can view chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Authenticated users can insert chart of accounts" ON public.chart_of_accounts;

CREATE POLICY "Users can manage their company chart of accounts" ON public.chart_of_accounts
FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
) WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);
