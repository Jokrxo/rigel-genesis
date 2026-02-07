
-- Add extended fields to companies table to support Company Profile
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS address_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS banking_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS founded_date DATE;

-- Allow update of companies by authenticated users (RLS check handles ownership)
-- We need to ensure the RLS policy allows UPDATE.
-- The existing policy for branches/etc checks company_id in profiles.
-- For companies table itself, we need a policy.

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT
  USING (id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own company" ON public.companies
  FOR UPDATE
  USING (id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Also allow inserting a company if the user doesn't have one?
-- Usually created during signup. But for now, let's assume it exists.
