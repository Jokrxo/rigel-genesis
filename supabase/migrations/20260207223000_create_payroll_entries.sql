
-- Create Payroll Entries Table
CREATE TABLE IF NOT EXISTS public.payroll_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  pay_period TEXT NOT NULL, -- YYYY-MM
  gross_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
  basic_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
  allowances NUMERIC(15,2) NOT NULL DEFAULT 0,
  overtime_pay NUMERIC(15,2) NOT NULL DEFAULT 0,
  paye_tax NUMERIC(15,2) NOT NULL DEFAULT 0,
  uif NUMERIC(15,2) NOT NULL DEFAULT 0,
  medical_aid NUMERIC(15,2) NOT NULL DEFAULT 0,
  pension_fund NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
  processed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage company payroll entries" ON public.payroll_entries FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Add missing columns to employees table if they don't exist (to match UI)
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS employee_number TEXT,
ADD COLUMN IF NOT EXISTS tax_number TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
