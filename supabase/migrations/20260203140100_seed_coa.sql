
-- Seed Chart of Accounts for South African SME
INSERT INTO public.chart_of_accounts (code, name, type, subtype) VALUES
-- ASSETS
-- Non-Current Assets
('1000', 'Property, Plant and Equipment', 'asset', 'fixed_asset'),
('1010', 'Motor Vehicles', 'asset', 'fixed_asset'),
('1020', 'Computer Equipment', 'asset', 'fixed_asset'),
('1030', 'Office Furniture', 'asset', 'fixed_asset'),
('1040', 'Accumulated Depreciation', 'asset', 'fixed_asset'),

-- Current Assets
('1100', 'Inventory', 'asset', 'current_asset'),
('1200', 'Trade Receivables (Debtors Control)', 'asset', 'current_asset'),
('1210', 'Allowance for Credit Losses', 'asset', 'current_asset'),
('1300', 'Cash and Cash Equivalents', 'asset', 'current_asset'),
('1310', 'Bank - Main Account', 'asset', 'current_asset'),
('1320', 'Petty Cash', 'asset', 'current_asset'),
('1400', 'VAT Receivable (Input)', 'asset', 'current_asset'),

-- EQUITY
('2000', 'Share Capital', 'equity', 'equity'),
('2100', 'Retained Earnings', 'equity', 'equity'),
('2200', 'Owner''s Drawings', 'equity', 'equity'),

-- LIABILITIES
-- Non-Current Liabilities
('3000', 'Long-term Loans', 'liability', 'long_term_liability'),

-- Current Liabilities
('3100', 'Trade Payables (Creditors Control)', 'liability', 'current_liability'),
('3200', 'VAT Payable (Output)', 'liability', 'current_liability'),
('3210', 'VAT Control Account', 'liability', 'current_liability'),
('3300', 'Payroll Liabilities (PAYE/UIF)', 'liability', 'current_liability'),
('3400', 'Accrued Expenses', 'liability', 'current_liability'),

-- INCOME
('4000', 'Sales / Revenue', 'income', 'sales'),
('4100', 'Services Rendered', 'income', 'sales'),
('4200', 'Other Income', 'income', 'other_income'),

-- EXPENSES
('5000', 'Cost of Goods Sold', 'expense', 'cost_of_sales'),
('6000', 'Accounting Fees', 'expense', 'operating_expense'),
('6010', 'Advertising', 'expense', 'operating_expense'),
('6020', 'Bank Charges', 'expense', 'operating_expense'),
('6030', 'Consulting Fees', 'expense', 'operating_expense'),
('6040', 'Depreciation Expense', 'expense', 'operating_expense'),
('6050', 'Employee Costs / Salaries', 'expense', 'operating_expense'),
('6060', 'Entertainment', 'expense', 'operating_expense'),
('6070', 'Insurance', 'expense', 'operating_expense'),
('6080', 'Interest Paid', 'expense', 'operating_expense'),
('6090', 'Legal Fees', 'expense', 'operating_expense'),
('6100', 'Motor Vehicle Expenses', 'expense', 'operating_expense'),
('6110', 'Office Expenses', 'expense', 'operating_expense'),
('6120', 'Printing and Stationery', 'expense', 'operating_expense'),
('6130', 'Rent Paid', 'expense', 'operating_expense'),
('6140', 'Repairs and Maintenance', 'expense', 'operating_expense'),
('6150', 'Telephone and Internet', 'expense', 'operating_expense'),
('6160', 'Travel and Accommodation', 'expense', 'operating_expense'),
('6170', 'Water and Electricity', 'expense', 'operating_expense'),
('6180', 'Bad Debts', 'expense', 'operating_expense')
ON CONFLICT (code) DO NOTHING;
