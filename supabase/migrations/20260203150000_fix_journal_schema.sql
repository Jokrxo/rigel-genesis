-- Fix journal_entry_lines to reference chart_of_accounts
-- First, we need to ensure account_id is compatible. 
-- Since we are in early dev, we can potentially drop/recreate or alter with casting. 
-- Assuming no critical data yet, or we can handle it gracefully.

-- Add foreign key to chart_of_accounts
ALTER TABLE public.journal_entry_lines 
    DROP COLUMN IF EXISTS account_id,
    ADD COLUMN account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id);

-- Add structured linking to journal_entries
ALTER TABLE public.journal_entries
    ADD COLUMN IF NOT EXISTS related_document_id UUID,
    ADD COLUMN IF NOT EXISTS related_document_type TEXT; -- e.g., 'invoice', 'payment', 'bill'

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON public.journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_related_doc ON public.journal_entries(related_document_id);
