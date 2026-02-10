
-- Create accountant_clients table to link accountants to companies
CREATE TABLE IF NOT EXISTS public.accountant_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accountant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active', -- 'active', 'pending', 'inactive'
    permissions JSONB DEFAULT '["view_reports", "manage_transactions"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(accountant_user_id, client_company_id)
);

-- Enable RLS
ALTER TABLE public.accountant_clients ENABLE ROW LEVEL SECURITY;

-- Policy: Accountants can view their own client links
CREATE POLICY "Accountants can view their client links" ON public.accountant_clients
    FOR SELECT
    USING (auth.uid() = accountant_user_id);

-- Policy: Owners can view who is accounting for them (optional, maybe distinct table for invites)
CREATE POLICY "Company owners can view their accountants" ON public.accountant_clients
    FOR SELECT
    USING (client_company_id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

-- Function to switch active company context
-- This allows an accountant to "become" a user of the client company temporarily
-- by updating their profile's company_id.
-- SECURITY CRITICAL: Must check accountant_clients table first.

CREATE OR REPLACE FUNCTION public.switch_company_context(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_authorized BOOLEAN;
BEGIN
    -- 1. Check if the user is linked to the target company via accountant_clients
    -- OR if the user is the owner/employee of that company directly (optional, usually profile.company_id is source of truth)
    
    -- Check if user is an accountant for this client
    SELECT EXISTS (
        SELECT 1 FROM public.accountant_clients 
        WHERE accountant_user_id = auth.uid() 
        AND client_company_id = target_company_id
        AND status = 'active'
    ) INTO is_authorized;

    -- If not an accountant, check if they "own" it (reverting to their original company)? 
    -- For simplicity, let's assume this function is ONLY for switching to a client.
    -- To switch "back", we might need to store their "home" company somewhere.
    -- For now, we just allow switching if authorized.

    IF NOT is_authorized THEN
        -- Check if it's their "home" company? (Complex logic omitted for brevity)
        RAISE EXCEPTION 'Not authorized to access this company';
    END IF;

    -- 2. Update the user's profile to point to the new company_id
    UPDATE public.profiles
    SET company_id = target_company_id,
        updated_at = now()
    WHERE user_id = auth.uid();

    RETURN TRUE;
END;
$$;
