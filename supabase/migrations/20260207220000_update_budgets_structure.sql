
-- Add columns to budgets table to match UI requirements
ALTER TABLE public.budgets
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS period_name TEXT; -- e.g. '2024-Q1'

-- Make account_id nullable if it's not already (it is nullable in creation script)
ALTER TABLE public.budgets ALTER COLUMN account_id DROP NOT NULL;

-- Make period_start/end nullable if we want to rely on period_name for now, or we can map it in API
ALTER TABLE public.budgets ALTER COLUMN period_start DROP NOT NULL;
ALTER TABLE public.budgets ALTER COLUMN period_end DROP NOT NULL;
