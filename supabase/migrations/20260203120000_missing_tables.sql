
-- Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  unit_of_measure TEXT DEFAULT 'units',
  is_active BOOLEAN DEFAULT true,
  tax_rate NUMERIC DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE USING (auth.uid() = user_id);


-- Create Fixed Assets Table
CREATE TABLE IF NOT EXISTS public.fixed_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT,
  purchase_date DATE NOT NULL,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  depreciation_rate NUMERIC NOT NULL DEFAULT 0,
  accum_depr NUMERIC DEFAULT 0,
  disposal_date DATE,
  selling_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fixed assets" ON public.fixed_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fixed assets" ON public.fixed_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fixed assets" ON public.fixed_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fixed assets" ON public.fixed_assets FOR DELETE USING (auth.uid() = user_id);


-- Create Directors Table
CREATE TABLE IF NOT EXISTS public.directors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  id_number TEXT,
  email TEXT,
  phone TEXT,
  appointment_date DATE,
  shareholding NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.directors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own directors" ON public.directors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own directors" ON public.directors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own directors" ON public.directors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own directors" ON public.directors FOR DELETE USING (auth.uid() = user_id);


-- Create Director Transactions Table
CREATE TABLE IF NOT EXISTS public.director_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  director_id UUID NOT NULL REFERENCES public.directors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL, -- 'loan_to_director', 'loan_from_director', 'salary', 'dividend', 'expense_reimbursement'
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.director_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own director transactions" ON public.director_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own director transactions" ON public.director_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own director transactions" ON public.director_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own director transactions" ON public.director_transactions FOR DELETE USING (auth.uid() = user_id);


-- Ensure Storage Bucket for Receipts exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid() = owner);

CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'receipts' AND auth.uid() = owner);
