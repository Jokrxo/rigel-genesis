
export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  subtype: string;
  isActive: boolean;
  description?: string;
}

export const initialAccounts: Account[] = [
  { id: '1', code: '1000', name: 'Main Bank Account', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: '3', code: '1500', name: 'Office Equipment', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: '4', code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: '5', code: '3000', name: 'Share Capital', type: 'equity', subtype: 'Equity', isActive: true },
  { id: '6', code: '4000', name: 'Sales Revenue', type: 'revenue', subtype: 'Operating Revenue', isActive: true },
  { id: '7', code: '6000', name: 'Office Supplies', type: 'expense', subtype: 'Operating Expense', isActive: true },
];

// Default South African Chart of Accounts (Expanded based on requirements)
export const SA_CHART_OF_ACCOUNTS: Account[] = [
  // --- Assets (A001–A046) ---
  // Current Assets
  { id: 'A001', code: '1000', name: 'Cash in Bank', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A002', code: '1010', name: 'Petty Cash', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A003', code: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A004', code: '1110', name: 'Trade Debtors', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A005', code: '1200', name: 'Inventory', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A006', code: '1300', name: 'VAT Receivable', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A007', code: '1400', name: 'Loans to Directors', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A008', code: '1410', name: 'Loans to Related Parties', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A009', code: '1420', name: 'Staff Loans', type: 'asset', subtype: 'Current Asset', isActive: true },
  // Non-Current Assets
  { id: 'A010', code: '1500', name: 'Property, Plant and Equipment (Cost)', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A011', code: '1510', name: 'Accumulated Depreciation', type: 'asset', subtype: 'Contra Asset', isActive: true },
  { id: 'A012', code: '1520', name: 'Motor Vehicles (Cost)', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A013', code: '1530', name: 'Motor Vehicles (Accum. Depr.)', type: 'asset', subtype: 'Contra Asset', isActive: true },
  { id: 'A014', code: '1540', name: 'Computer Equipment (Cost)', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A015', code: '1550', name: 'Computer Equipment (Accum. Depr.)', type: 'asset', subtype: 'Contra Asset', isActive: true },
  { id: 'A016', code: '1560', name: 'Furniture & Fittings (Cost)', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A017', code: '1570', name: 'Furniture & Fittings (Accum. Depr.)', type: 'asset', subtype: 'Contra Asset', isActive: true },
  { id: 'A018', code: '1600', name: 'Investments', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A019', code: '1700', name: 'Goodwill', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A020', code: '1710', name: 'Intellectual Property', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A021', code: '1720', name: 'Other Intangible Assets', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A022', code: '1800', name: 'Investments in Subsidiaries', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A023', code: '1810', name: 'Investments in Associates', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A024', code: '1820', name: 'Other Investments', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A025', code: '1830', name: 'Deferred Tax Asset', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A026', code: '1840', name: 'Loan Levy', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A027', code: '1850', name: 'Deposits Paid', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A028', code: '1860', name: 'Prepayments', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A029', code: '1870', name: 'Accrued Income', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A030', code: '1880', name: 'Inventory - Raw Materials', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A031', code: '1890', name: 'Inventory - Work in Progress', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A032', code: '1900', name: 'Inventory - Finished Goods', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A033', code: '1910', name: 'Consumables', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A034', code: '1920', name: 'Input VAT', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A035', code: '1930', name: 'Output VAT', type: 'liability', subtype: 'Current Liability', isActive: true }, // Usually liability, but keeping ID sequence
  { id: 'A036', code: '1940', name: 'Bank - Savings', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A037', code: '1950', name: 'Bank - Credit Card', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'A038', code: '1960', name: 'Cash Float', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A039', code: '1970', name: 'Donations Receivable', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A040', code: '1980', name: 'Grants Receivable', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A041', code: '1990', name: 'Other Receivables', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A042', code: '1991', name: 'Suspense Account', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A043', code: '1992', name: 'Clearing Account', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A044', code: '1993', name: 'Retentions', type: 'asset', subtype: 'Current Asset', isActive: true },
  { id: 'A045', code: '1994', name: 'Construction in Progress', type: 'asset', subtype: 'Non-Current Asset', isActive: true },
  { id: 'A046', code: '1995', name: 'Development Costs', type: 'asset', subtype: 'Non-Current Asset', isActive: true },

  // --- Liabilities (L001–L017) ---
  // Current Liabilities
  { id: 'L001', code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L002', code: '2010', name: 'Trade Creditors', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L003', code: '2200', name: 'VAT Payable', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L004', code: '2300', name: 'Salary Accruals', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L005', code: '2400', name: 'PAYE Payable', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L006', code: '2410', name: 'UIF Payable', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L007', code: '2420', name: 'SDL Payable', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L008', code: '2500', name: 'Income Tax Payable', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L009', code: '2550', name: 'Customer Deposits', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L010', code: '2600', name: 'Long-term Loan - Lender 1', type: 'liability', subtype: 'Non-Current Liability', isActive: true },
  { id: 'L011', code: '2610', name: 'Long-term Loan - Lender 2', type: 'liability', subtype: 'Non-Current Liability', isActive: true },
  { id: 'L012', code: '2700', name: 'Directors Loan Account (Cr)', type: 'liability', subtype: 'Non-Current Liability', isActive: true },
  { id: 'L013', code: '2800', name: 'Deferred Tax Liability', type: 'liability', subtype: 'Non-Current Liability', isActive: true },
  { id: 'L014', code: '2810', name: 'Installment Sale Agreements', type: 'liability', subtype: 'Non-Current Liability', isActive: true },
  { id: 'L015', code: '2820', name: 'Lease Liabilities', type: 'liability', subtype: 'Non-Current Liability', isActive: true },
  { id: 'L016', code: '2830', name: 'Provisions', type: 'liability', subtype: 'Current Liability', isActive: true },
  { id: 'L017', code: '2840', name: 'Dividends Payable', type: 'liability', subtype: 'Current Liability', isActive: true },

  // --- Equity (NA001–NA003) ---
  { id: 'NA001', code: '3000', name: 'Share Capital', type: 'equity', subtype: 'Equity', isActive: true },
  { id: 'NA002', code: '3100', name: 'Retained Earnings', type: 'equity', subtype: 'Equity', isActive: true },
  { id: 'NA003', code: '3200', name: 'Current Year Profit/Loss', type: 'equity', subtype: 'Equity', isActive: true },

  // --- Revenue (I001–I007) ---
  { id: 'I001', code: '4000', name: 'Sales Revenue', type: 'revenue', subtype: 'Operating Revenue', isActive: true },
  { id: 'I002', code: '4010', name: 'Commission Income', type: 'revenue', subtype: 'Operating Revenue', isActive: true },
  { id: 'I003', code: '4020', name: 'Consulting Income', type: 'revenue', subtype: 'Operating Revenue', isActive: true },
  { id: 'I004', code: '4030', name: 'Interest Income', type: 'revenue', subtype: 'Other Income', isActive: true },
  { id: 'I005', code: '4040', name: 'Other Revenue', type: 'revenue', subtype: 'Operating Revenue', isActive: true },
  { id: 'I006', code: '4050', name: 'Profit on Sale of Asset', type: 'revenue', subtype: 'Other Income', isActive: true },
  { id: 'I007', code: '4060', name: 'Recoveries', type: 'revenue', subtype: 'Other Income', isActive: true },

  // --- Expenditure (E001–E039) ---
  // Cost of Sales
  { id: 'E001', code: '5000', name: 'Cost of Sales', type: 'expense', subtype: 'COGS', isActive: true },
  { id: 'E002', code: '5100', name: 'Opening Stock', type: 'expense', subtype: 'COGS', isActive: true },
  { id: 'E003', code: '5200', name: 'Purchases', type: 'expense', subtype: 'COGS', isActive: true },
  { id: 'E004', code: '5300', name: 'Closing Stock', type: 'expense', subtype: 'COGS', isActive: true },
  
  // Operating Expenses
  { id: 'E010', code: '6000', name: 'Office Supplies', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E011', code: '6010', name: 'Salaries and Wages', type: 'expense', subtype: 'HR', isActive: true },
  { id: 'E012', code: '6020', name: 'Utilities', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E013', code: '6030', name: 'Rent', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E014', code: '6040', name: 'Insurance', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E015', code: '6050', name: 'Marketing', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E016', code: '6060', name: 'Professional Services', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E017', code: '6070', name: 'Depreciation', type: 'expense', subtype: 'Depreciation', isActive: true },
  { id: 'E018', code: '6080', name: 'SARS/Tax Penalties', type: 'expense', subtype: 'SARS/Tax', isActive: true },
  { id: 'E019', code: '6090', name: 'Bank Charges', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E020', code: '6100', name: 'Cleaning', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E021', code: '6110', name: 'Computer Expenses', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E022', code: '6120', name: 'Consulting Fees', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E023', code: '6130', name: 'Courier and Postage', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E024', code: '6140', name: 'Donations', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E025', code: '6150', name: 'Electricity and Water', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E026', code: '6160', name: 'Entertainment', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E027', code: '6170', name: 'General Expenses', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E028', code: '6180', name: 'Internet and Telephone', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E029', code: '6190', name: 'Legal Fees', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E030', code: '6200', name: 'Motor Vehicle Expenses', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E031', code: '6210', name: 'Printing and Stationery', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E032', code: '6220', name: 'Repairs and Maintenance', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E033', code: '6230', name: 'Security', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E034', code: '6240', name: 'Staff Training', type: 'expense', subtype: 'HR', isActive: true },
  { id: 'E035', code: '6250', name: 'Staff Welfare', type: 'expense', subtype: 'HR', isActive: true },
  { id: 'E036', code: '6260', name: 'Subscriptions', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E037', code: '6270', name: 'Travel - Local', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E038', code: '6280', name: 'Travel - Overseas', type: 'expense', subtype: 'Operating Expense', isActive: true },
  { id: 'E039', code: '6290', name: 'Workmen\'s Compensation', type: 'expense', subtype: 'HR', isActive: true },
];

const STORAGE_KEY = 'rigel_chart_of_accounts';

export const chartOfAccountsApi = {
  getAccounts: async (): Promise<Account[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return initialAccounts;
    }
    return JSON.parse(stored);
  },

  saveAccount: async (account: Account): Promise<void> => {
    const accounts = await chartOfAccountsApi.getAccounts();
    accounts.push(account);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  },
  
  updateAccount: async (updatedAccount: Account): Promise<void> => {
      const accounts = await chartOfAccountsApi.getAccounts();
      const index = accounts.findIndex(a => a.id === updatedAccount.id);
      if (index !== -1) {
          accounts[index] = updatedAccount;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      }
  },

  // Soft-deactivate account; protect core accounts
  deleteAccount: async (id: string): Promise<void> => {
      const accounts = await chartOfAccountsApi.getAccounts();
      const protectedCodes = new Set(['1000', '1100', '2000', '3000', '4000']);
      const idx = accounts.findIndex(a => a.id === id);
      if (idx === -1) return;
      const acc = accounts[idx];
      if (protectedCodes.has(acc.code)) {
        // Keep protected accounts active
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
        return;
      }
      accounts[idx] = { ...acc, isActive: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  },

  // Seed missing accounts from SA_CHART_OF_ACCOUNTS; idempotent insert of active accounts only
  seedDefaultSAChart: async (): Promise<number> => {
    const existing = await chartOfAccountsApi.getAccounts();
    const existingCodes = new Set(existing.map(a => a.code));
    const toInsert: Account[] = SA_CHART_OF_ACCOUNTS
      .filter(a => !existingCodes.has(a.code))
      .map(a => ({ ...a, id: crypto.randomUUID(), isActive: true }));
    const merged = [...existing, ...toInsert];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return toInsert.length;
  }
};
