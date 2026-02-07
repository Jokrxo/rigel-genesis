-- Create Receipts Table
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'cheque', 'other')),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for receipts
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts" ON public.receipts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts" ON public.receipts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts" ON public.receipts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts" ON public.receipts
    FOR DELETE USING (auth.uid() = user_id);

-- Create Receipt Allocations Table
CREATE TABLE IF NOT EXISTS public.receipt_allocations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.sales_documents(id) ON DELETE CASCADE,
    amount_applied NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for receipt_allocations
ALTER TABLE public.receipt_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipt allocations" ON public.receipt_allocations
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_allocations.receipt_id AND receipts.user_id = auth.uid()));

CREATE POLICY "Users can insert own receipt allocations" ON public.receipt_allocations
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_allocations.receipt_id AND receipts.user_id = auth.uid()));

CREATE POLICY "Users can update own receipt allocations" ON public.receipt_allocations
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_allocations.receipt_id AND receipts.user_id = auth.uid()));

CREATE POLICY "Users can delete own receipt allocations" ON public.receipt_allocations
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_allocations.receipt_id AND receipts.user_id = auth.uid()));
