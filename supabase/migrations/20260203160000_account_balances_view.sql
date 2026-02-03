-- View to calculate real-time account balances
CREATE OR REPLACE VIEW public.account_balances AS
SELECT 
    a.id as account_id,
    a.code,
    a.name,
    a.type,
    a.subtype,
    COALESCE(SUM(l.debit), 0) as total_debit,
    COALESCE(SUM(l.credit), 0) as total_credit,
    CASE 
        WHEN a.type IN ('asset', 'expense') THEN COALESCE(SUM(l.debit), 0) - COALESCE(SUM(l.credit), 0)
        ELSE COALESCE(SUM(l.credit), 0) - COALESCE(SUM(l.debit), 0)
    END as current_balance
FROM 
    public.chart_of_accounts a
LEFT JOIN 
    public.journal_entry_lines l ON a.id = l.account_id
LEFT JOIN
    public.journal_entries je ON l.journal_entry_id = je.id AND je.status = 'posted'
GROUP BY 
    a.id, a.code, a.name, a.type, a.subtype;

-- Grant access to authenticated users
GRANT SELECT ON public.account_balances TO authenticated;
