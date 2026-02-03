CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_code TEXT NOT NULL,
  name TEXT NOT NULL,
  tax_number TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  shipping_same_as_billing BOOLEAN DEFAULT true,
  credit_limit NUMERIC DEFAULT 0,
  payment_terms TEXT DEFAULT '30_days',
  assigned_salesperson TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'customers'
        AND policyname = 'Users can view their own customers'
    ) THEN
        CREATE POLICY "Users can view their own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'customers'
        AND policyname = 'Users can insert their own customers'
    ) THEN
        CREATE POLICY "Users can insert their own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'customers'
        AND policyname = 'Users can update their own customers'
    ) THEN
        CREATE POLICY "Users can update their own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'customers'
        AND policyname = 'Users can delete their own customers'
    ) THEN
        CREATE POLICY "Users can delete their own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);
    END IF;
END
$$;
