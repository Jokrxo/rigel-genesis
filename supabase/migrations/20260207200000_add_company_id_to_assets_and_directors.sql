
-- Add company_id to fixed_assets
ALTER TABLE public.fixed_assets
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Update RLS for fixed_assets
DROP POLICY IF EXISTS "Users can view their own fixed assets" ON public.fixed_assets;
DROP POLICY IF EXISTS "Users can insert their own fixed assets" ON public.fixed_assets;
DROP POLICY IF EXISTS "Users can update their own fixed assets" ON public.fixed_assets;
DROP POLICY IF EXISTS "Users can delete their own fixed assets" ON public.fixed_assets;

CREATE POLICY "Users can manage company fixed assets" ON public.fixed_assets FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Add company_id to directors
ALTER TABLE public.directors
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Update RLS for directors
DROP POLICY IF EXISTS "Users can view their own directors" ON public.directors;
DROP POLICY IF EXISTS "Users can insert their own directors" ON public.directors;
DROP POLICY IF EXISTS "Users can update their own directors" ON public.directors;
DROP POLICY IF EXISTS "Users can delete their own directors" ON public.directors;

CREATE POLICY "Users can manage company directors" ON public.directors FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Add company_id to director_transactions
ALTER TABLE public.director_transactions
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Update RLS for director_transactions
DROP POLICY IF EXISTS "Users can view their own director transactions" ON public.director_transactions;
DROP POLICY IF EXISTS "Users can insert their own director transactions" ON public.director_transactions;
DROP POLICY IF EXISTS "Users can update their own director transactions" ON public.director_transactions;
DROP POLICY IF EXISTS "Users can delete their own director transactions" ON public.director_transactions;

CREATE POLICY "Users can manage company director transactions" ON public.director_transactions FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));
