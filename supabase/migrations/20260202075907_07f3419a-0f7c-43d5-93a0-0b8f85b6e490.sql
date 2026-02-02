-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create countries lookup table
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  currency_code TEXT DEFAULT 'USD'
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Countries are publicly readable" ON public.countries FOR SELECT USING (true);

INSERT INTO public.countries (code, name, tax_rate, currency_code) VALUES
  ('ZAF', 'South Africa', 28.00, 'ZAR'),
  ('USA', 'United States', 21.00, 'USD'),
  ('GBR', 'United Kingdom', 19.00, 'GBP'),
  ('AUS', 'Australia', 30.00, 'AUD');

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  vat_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'South Africa',
  payment_terms INTEGER DEFAULT 30,
  credit_limit NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT,
  unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(15,2),
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  unit_of_measure TEXT DEFAULT 'units',
  is_active BOOLEAN DEFAULT true,
  tax_rate NUMERIC(5,2) DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- Create documents table (invoices, quotations, credit notes)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'quotation', 'credit_note')),
  document_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  valid_until DATE,
  subtotal NUMERIC(15,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  total_amount NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled', 'overdue')),
  terms_and_conditions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Create document line items table
CREATE TABLE public.document_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT,
  quantity NUMERIC(15,4) DEFAULT 1,
  unit_price NUMERIC(15,2) DEFAULT 0,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 15,
  line_total NUMERIC(15,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.document_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own line items" ON public.document_line_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.documents WHERE documents.id = document_line_items.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can insert own line items" ON public.document_line_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.documents WHERE documents.id = document_line_items.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can update own line items" ON public.document_line_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.documents WHERE documents.id = document_line_items.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can delete own line items" ON public.document_line_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.documents WHERE documents.id = document_line_items.document_id AND documents.user_id = auth.uid()));

-- Create deferred tax projects table
CREATE TABLE public.deferred_tax_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  country_id UUID REFERENCES public.countries(id),
  tax_rate NUMERIC(5,2) DEFAULT 28,
  fiscal_year_end DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.deferred_tax_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax projects" ON public.deferred_tax_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tax projects" ON public.deferred_tax_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tax projects" ON public.deferred_tax_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tax projects" ON public.deferred_tax_projects FOR DELETE USING (auth.uid() = user_id);

-- Create deferred tax categories table
CREATE TABLE public.deferred_tax_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.deferred_tax_projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('temporary_difference', 'permanent_difference')),
  accounting_base NUMERIC(15,2) DEFAULT 0,
  tax_base NUMERIC(15,2) DEFAULT 0,
  temporary_difference NUMERIC(15,2) DEFAULT 0,
  deferred_tax_asset NUMERIC(15,2) DEFAULT 0,
  deferred_tax_liability NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.deferred_tax_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax categories" ON public.deferred_tax_categories FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = deferred_tax_categories.project_id AND deferred_tax_projects.user_id = auth.uid()));
CREATE POLICY "Users can insert own tax categories" ON public.deferred_tax_categories FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = deferred_tax_categories.project_id AND deferred_tax_projects.user_id = auth.uid()));
CREATE POLICY "Users can update own tax categories" ON public.deferred_tax_categories FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = deferred_tax_categories.project_id AND deferred_tax_projects.user_id = auth.uid()));
CREATE POLICY "Users can delete own tax categories" ON public.deferred_tax_categories FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = deferred_tax_categories.project_id AND deferred_tax_projects.user_id = auth.uid()));

-- Create tax loss carry forwards table
CREATE TABLE public.tax_loss_carry_forwards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.deferred_tax_projects(id) ON DELETE CASCADE NOT NULL,
  loss_year INTEGER NOT NULL,
  original_amount NUMERIC(15,2) NOT NULL,
  utilized_amount NUMERIC(15,2) DEFAULT 0,
  remaining_amount NUMERIC(15,2) NOT NULL,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.tax_loss_carry_forwards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax losses" ON public.tax_loss_carry_forwards FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = tax_loss_carry_forwards.project_id AND deferred_tax_projects.user_id = auth.uid()));
CREATE POLICY "Users can insert own tax losses" ON public.tax_loss_carry_forwards FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = tax_loss_carry_forwards.project_id AND deferred_tax_projects.user_id = auth.uid()));
CREATE POLICY "Users can update own tax losses" ON public.tax_loss_carry_forwards FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = tax_loss_carry_forwards.project_id AND deferred_tax_projects.user_id = auth.uid()));
CREATE POLICY "Users can delete own tax losses" ON public.tax_loss_carry_forwards FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = tax_loss_carry_forwards.project_id AND deferred_tax_projects.user_id = auth.uid()));

-- Create deferred tax movements table
CREATE TABLE public.deferred_tax_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.deferred_tax_projects(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.deferred_tax_categories(id) ON DELETE SET NULL,
  loss_id UUID REFERENCES public.tax_loss_carry_forwards(id) ON DELETE SET NULL,
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('opening', 'addition', 'reversal', 'closing')),
  amount NUMERIC(15,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.deferred_tax_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax movements" ON public.deferred_tax_movements FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = deferred_tax_movements.project_id AND deferred_tax_projects.user_id = auth.uid()));
CREATE POLICY "Users can insert own tax movements" ON public.deferred_tax_movements FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = deferred_tax_movements.project_id AND deferred_tax_projects.user_id = auth.uid()));
CREATE POLICY "Users can update own tax movements" ON public.deferred_tax_movements FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = deferred_tax_movements.project_id AND deferred_tax_projects.user_id = auth.uid()));
CREATE POLICY "Users can delete own tax movements" ON public.deferred_tax_movements FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.deferred_tax_projects WHERE deferred_tax_projects.id = deferred_tax_movements.project_id AND deferred_tax_projects.user_id = auth.uid()));

-- Create data issues table for financial analysis
CREATE TABLE public.data_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_id UUID,
  issue_type TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error')),
  description TEXT NOT NULL,
  affected_data JSONB,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.data_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data issues" ON public.data_issues FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data issues" ON public.data_issues FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data issues" ON public.data_issues FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data issues" ON public.data_issues FOR DELETE USING (auth.uid() = user_id);