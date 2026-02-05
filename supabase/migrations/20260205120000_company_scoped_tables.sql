-- Company-scoped core tables and RLS policies
-- This migration adds company-level entities required by the application
-- and aligns RLS with profiles.company_id for organization-based access.

-- Companies table (foundation for company_id references)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT,
  vat_number TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add company_id to profiles to support org-based RLS policies
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- Branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage branches" ON public.branches FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.chart_of_accounts(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  budgeted_amount NUMERIC DEFAULT 0,
  actual_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage budgets" ON public.budgets FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Bills table (Accounts Payable)
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  bill_number TEXT NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage bills" ON public.bills FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  order_number TEXT NOT NULL,
  order_date DATE NOT NULL,
  expected_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage purchase_orders" ON public.purchase_orders FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  quote_number TEXT NOT NULL,
  quote_date DATE NOT NULL,
  valid_until DATE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage quotes" ON public.quotes FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Quote Items table
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 15,
  total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage quote_items" ON public.quote_items FOR ALL
  USING (
    quote_id IN (
      SELECT id FROM public.quotes 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    quote_id IN (
      SELECT id FROM public.quotes 
      WHERE company_id IN (
        SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Fixed Assets: augment existing table to support company scope and additional fields
ALTER TABLE public.fixed_assets
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS asset_name TEXT,
  ADD COLUMN IF NOT EXISTS asset_code TEXT,
  ADD COLUMN IF NOT EXISTS asset_type TEXT,
  ADD COLUMN IF NOT EXISTS purchase_price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS useful_life_years INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS salvage_value NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS depreciation_method TEXT DEFAULT 'straight_line',
  ADD COLUMN IF NOT EXISTS accumulated_depreciation NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage fixed_assets" ON public.fixed_assets FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_number TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  tax_number TEXT,
  position TEXT,
  department TEXT,
  hire_date DATE,
  termination_date DATE,
  salary_type TEXT DEFAULT 'monthly',
  basic_salary NUMERIC DEFAULT 0,
  bank_name TEXT,
  bank_account_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage employees" ON public.employees FOR ALL
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

