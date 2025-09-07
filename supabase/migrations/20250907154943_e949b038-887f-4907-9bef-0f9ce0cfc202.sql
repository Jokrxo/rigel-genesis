-- Create countries table for tax table management
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  corporate_tax_rate NUMERIC(5,2) NOT NULL DEFAULT 27.00,
  capital_gains_tax_inclusion NUMERIC(5,2) NOT NULL DEFAULT 80.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deferred tax projects table
CREATE TABLE public.deferred_tax_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  country_id UUID NOT NULL REFERENCES public.countries(id),
  tax_year INTEGER NOT NULL,
  reporting_currency TEXT NOT NULL DEFAULT 'ZAR',
  multi_entity BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deferred tax categories table
CREATE TABLE public.deferred_tax_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.deferred_tax_projects(id) ON DELETE CASCADE,
  entity_name TEXT,
  category_type TEXT NOT NULL CHECK (category_type IN ('temporary_taxable', 'temporary_deductible', 'tax_losses', 'initial_recognition', 'uncertain_positions')),
  description TEXT NOT NULL,
  book_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  temporary_difference NUMERIC(15,2) NOT NULL DEFAULT 0,
  applicable_tax_rate NUMERIC(5,2) NOT NULL,
  deferred_tax_asset NUMERIC(15,2) NOT NULL DEFAULT 0,
  deferred_tax_liability NUMERIC(15,2) NOT NULL DEFAULT 0,
  recognition_criteria_met BOOLEAN NOT NULL DEFAULT true,
  reversal_pattern TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tax loss carry forwards table
CREATE TABLE public.tax_loss_carry_forwards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.deferred_tax_projects(id) ON DELETE CASCADE,
  entity_name TEXT,
  loss_type TEXT NOT NULL CHECK (loss_type IN ('assessed_loss', 'capital_loss', 'other')),
  loss_amount NUMERIC(15,2) NOT NULL,
  origination_year INTEGER NOT NULL,
  expiry_year INTEGER,
  utilization_probability NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  deferred_tax_asset NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deferred tax movements table
CREATE TABLE public.deferred_tax_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.deferred_tax_projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.deferred_tax_categories(id) ON DELETE CASCADE,
  loss_id UUID REFERENCES public.tax_loss_carry_forwards(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('opening_balance', 'origination', 'reversal', 'rate_change', 'closing_balance')),
  deferred_tax_asset_movement NUMERIC(15,2) NOT NULL DEFAULT 0,
  deferred_tax_liability_movement NUMERIC(15,2) NOT NULL DEFAULT 0,
  movement_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deferred_tax_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deferred_tax_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_loss_carry_forwards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deferred_tax_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for countries (public read access)
CREATE POLICY "Countries are viewable by everyone" 
ON public.countries 
FOR SELECT 
USING (true);

-- Create RLS policies for deferred tax projects
CREATE POLICY "Users can view their own deferred tax projects" 
ON public.deferred_tax_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deferred tax projects" 
ON public.deferred_tax_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deferred tax projects" 
ON public.deferred_tax_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deferred tax projects" 
ON public.deferred_tax_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for deferred tax categories
CREATE POLICY "Users can view their own deferred tax categories" 
ON public.deferred_tax_categories 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

CREATE POLICY "Users can create their own deferred tax categories" 
ON public.deferred_tax_categories 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

CREATE POLICY "Users can update their own deferred tax categories" 
ON public.deferred_tax_categories 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own deferred tax categories" 
ON public.deferred_tax_categories 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

-- Similar policies for tax loss carry forwards
CREATE POLICY "Users can view their own tax loss carry forwards" 
ON public.tax_loss_carry_forwards 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

CREATE POLICY "Users can create their own tax loss carry forwards" 
ON public.tax_loss_carry_forwards 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

CREATE POLICY "Users can update their own tax loss carry forwards" 
ON public.tax_loss_carry_forwards 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own tax loss carry forwards" 
ON public.tax_loss_carry_forwards 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

-- Similar policies for deferred tax movements
CREATE POLICY "Users can view their own deferred tax movements" 
ON public.deferred_tax_movements 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

CREATE POLICY "Users can create their own deferred tax movements" 
ON public.deferred_tax_movements 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

CREATE POLICY "Users can update their own deferred tax movements" 
ON public.deferred_tax_movements 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own deferred tax movements" 
ON public.deferred_tax_movements 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.deferred_tax_projects dtp 
  WHERE dtp.id = project_id AND dtp.user_id = auth.uid()
));

-- Insert default countries
INSERT INTO public.countries (code, name, corporate_tax_rate, capital_gains_tax_inclusion) VALUES
('ZA', 'South Africa', 27.00, 80.00),
('US', 'United States', 21.00, 100.00),
('UK', 'United Kingdom', 25.00, 100.00),
('AU', 'Australia', 30.00, 50.00),
('CA', 'Canada', 15.00, 50.00),
('DE', 'Germany', 29.90, 100.00),
('FR', 'France', 25.00, 100.00);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deferred_tax_projects_updated_at
  BEFORE UPDATE ON public.deferred_tax_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deferred_tax_categories_updated_at
  BEFORE UPDATE ON public.deferred_tax_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_loss_carry_forwards_updated_at
  BEFORE UPDATE ON public.tax_loss_carry_forwards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();