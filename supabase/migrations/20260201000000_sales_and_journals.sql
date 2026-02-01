
-- Create Sales Documents Table (covers Invoices and Quotations)
CREATE TABLE IF NOT EXISTS public.sales_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    customer_id UUID REFERENCES public.customers(id),
    document_type TEXT NOT NULL, -- 'invoice', 'quotation'
    document_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    valid_until DATE,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, void, accepted, rejected
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    terms_and_conditions TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Sales Document Items Table
CREATE TABLE IF NOT EXISTS public.sales_document_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.sales_documents(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id), -- Optional link to inventory
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    discount_percentage NUMERIC DEFAULT 0,
    tax_rate NUMERIC DEFAULT 15,
    line_total NUMERIC NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Journal Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    entry_number TEXT,
    date DATE NOT NULL,
    reference TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, posted
    type TEXT NOT NULL DEFAULT 'standard', -- standard, adjustment
    approval_status TEXT DEFAULT 'pending', -- pending, approved, rejected
    total_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Journal Entry Lines Table
CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL, -- Referring to Chart of Accounts
    description TEXT,
    debit NUMERIC NOT NULL DEFAULT 0,
    credit NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create User Ratings Table
CREATE TABLE IF NOT EXISTS public.user_ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.sales_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- Sales Documents Policies
CREATE POLICY "Users can view their own sales documents" ON public.sales_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sales documents" ON public.sales_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales documents" ON public.sales_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales documents" ON public.sales_documents FOR DELETE USING (auth.uid() = user_id);

-- Sales Document Items Policies
CREATE POLICY "Users can view their own document items" ON public.sales_document_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.sales_documents WHERE sales_documents.id = sales_document_items.document_id AND sales_documents.user_id = auth.uid()));
CREATE POLICY "Users can insert their own document items" ON public.sales_document_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.sales_documents WHERE sales_documents.id = sales_document_items.document_id AND sales_documents.user_id = auth.uid()));
CREATE POLICY "Users can update their own document items" ON public.sales_document_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.sales_documents WHERE sales_documents.id = sales_document_items.document_id AND sales_documents.user_id = auth.uid()));
CREATE POLICY "Users can delete their own document items" ON public.sales_document_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.sales_documents WHERE sales_documents.id = sales_document_items.document_id AND sales_documents.user_id = auth.uid()));

-- Journal Entries Policies
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Journal Entry Lines Policies
CREATE POLICY "Users can view their own journal lines" ON public.journal_entry_lines FOR SELECT USING (EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));
CREATE POLICY "Users can insert their own journal lines" ON public.journal_entry_lines FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));
CREATE POLICY "Users can update their own journal lines" ON public.journal_entry_lines FOR UPDATE USING (EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));
CREATE POLICY "Users can delete their own journal lines" ON public.journal_entry_lines FOR DELETE USING (EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_entry_lines.journal_entry_id AND journal_entries.user_id = auth.uid()));

-- User Ratings Policies
CREATE POLICY "Users can view their own ratings" ON public.user_ratings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ratings" ON public.user_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
