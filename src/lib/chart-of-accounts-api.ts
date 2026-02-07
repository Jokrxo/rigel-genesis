
import { supabase } from "@/integrations/supabase/client";
import { auditLogger } from "@/utils/auditLogger";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  subtype: string;
  isActive: boolean;
  description?: string;
  company_id?: string;
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
export const SA_CHART_OF_ACCOUNTS: Omit<Account, 'id' | 'isActive'>[] = [
  // --- Assets (A001–A046) ---
  // Current Assets
  { code: '1000', name: 'Cash in Bank', type: 'asset', subtype: 'Current Asset' },
  { code: '1010', name: 'Petty Cash', type: 'asset', subtype: 'Current Asset' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'Current Asset' },
  { code: '1110', name: 'Trade Debtors', type: 'asset', subtype: 'Current Asset' },
  { code: '1200', name: 'Inventory', type: 'asset', subtype: 'Current Asset' },
  { code: '1300', name: 'VAT Receivable', type: 'asset', subtype: 'Current Asset' },
  { code: '1400', name: 'Loans to Directors', type: 'asset', subtype: 'Current Asset' },
  { code: '1410', name: 'Loans to Related Parties', type: 'asset', subtype: 'Current Asset' },
  { code: '1420', name: 'Staff Loans', type: 'asset', subtype: 'Current Asset' },
  // Non-Current Assets
  { code: '1500', name: 'Property, Plant and Equipment (Cost)', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1510', name: 'Accumulated Depreciation', type: 'asset', subtype: 'Contra Asset' },
  { code: '1520', name: 'Motor Vehicles (Cost)', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1530', name: 'Motor Vehicles (Accum. Depr.)', type: 'asset', subtype: 'Contra Asset' },
  { code: '1540', name: 'Computer Equipment (Cost)', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1550', name: 'Computer Equipment (Accum. Depr.)', type: 'asset', subtype: 'Contra Asset' },
  { code: '1560', name: 'Furniture & Fittings (Cost)', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1570', name: 'Furniture & Fittings (Accum. Depr.)', type: 'asset', subtype: 'Contra Asset' },
  { code: '1600', name: 'Investments', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1700', name: 'Goodwill', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1710', name: 'Intellectual Property', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1720', name: 'Other Intangible Assets', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1800', name: 'Investments in Subsidiaries', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1810', name: 'Investments in Associates', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1820', name: 'Other Investments', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1830', name: 'Deferred Tax Asset', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1840', name: 'Loan Levy', type: 'asset', subtype: 'Current Asset' },
  { code: '1850', name: 'Deposits Paid', type: 'asset', subtype: 'Current Asset' },
  { code: '1860', name: 'Prepayments', type: 'asset', subtype: 'Current Asset' },
  { code: '1870', name: 'Accrued Income', type: 'asset', subtype: 'Current Asset' },
  { code: '1880', name: 'Inventory - Raw Materials', type: 'asset', subtype: 'Current Asset' },
  { code: '1890', name: 'Inventory - Work in Progress', type: 'asset', subtype: 'Current Asset' },
  { code: '1900', name: 'Inventory - Finished Goods', type: 'asset', subtype: 'Current Asset' },
  { code: '1910', name: 'Consumables', type: 'asset', subtype: 'Current Asset' },
  { code: '1920', name: 'Input VAT', type: 'asset', subtype: 'Current Asset' },
  { code: '1930', name: 'Output VAT', type: 'liability', subtype: 'Current Liability' },
  { code: '1940', name: 'Bank - Savings', type: 'asset', subtype: 'Current Asset' },
  { code: '1950', name: 'Bank - Credit Card', type: 'liability', subtype: 'Current Liability' },
  { code: '1960', name: 'Cash Float', type: 'asset', subtype: 'Current Asset' },
  { code: '1970', name: 'Donations Receivable', type: 'asset', subtype: 'Current Asset' },
  { code: '1980', name: 'Grants Receivable', type: 'asset', subtype: 'Current Asset' },
  { code: '1990', name: 'Other Receivables', type: 'asset', subtype: 'Current Asset' },
  { code: '1991', name: 'Suspense Account', type: 'asset', subtype: 'Current Asset' },
  { code: '1992', name: 'Clearing Account', type: 'asset', subtype: 'Current Asset' },
  { code: '1993', name: 'Retentions', type: 'asset', subtype: 'Current Asset' },
  { code: '1994', name: 'Construction in Progress', type: 'asset', subtype: 'Non-Current Asset' },
  { code: '1995', name: 'Development Costs', type: 'asset', subtype: 'Non-Current Asset' },

  // --- Liabilities (L001–L017) ---
  // Current Liabilities
  { code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'Current Liability' },
  { code: '2010', name: 'Trade Creditors', type: 'liability', subtype: 'Current Liability' },
  { code: '2200', name: 'VAT Payable', type: 'liability', subtype: 'Current Liability' },
  { code: '2300', name: 'Salary Accruals', type: 'liability', subtype: 'Current Liability' },
  { code: '2400', name: 'PAYE Payable', type: 'liability', subtype: 'Current Liability' },
  { code: '2410', name: 'UIF Payable', type: 'liability', subtype: 'Current Liability' },
  { code: '2420', name: 'SDL Payable', type: 'liability', subtype: 'Current Liability' },
  { code: '2500', name: 'Income Tax Payable', type: 'liability', subtype: 'Current Liability' },
  { code: '2550', name: 'Customer Deposits', type: 'liability', subtype: 'Current Liability' },
  { code: '2600', name: 'Long-term Loan - Lender 1', type: 'liability', subtype: 'Non-Current Liability' },
  { code: '2610', name: 'Long-term Loan - Lender 2', type: 'liability', subtype: 'Non-Current Liability' },
  { code: '2700', name: 'Directors Loan Account (Cr)', type: 'liability', subtype: 'Non-Current Liability' },
  { code: '2800', name: 'Deferred Tax Liability', type: 'liability', subtype: 'Non-Current Liability' },
  { code: '2810', name: 'Installment Sale Agreements', type: 'liability', subtype: 'Non-Current Liability' },
  { code: '2820', name: 'Lease Liabilities', type: 'liability', subtype: 'Non-Current Liability' },
  { code: '2830', name: 'Provisions', type: 'liability', subtype: 'Current Liability' },
  { code: '2840', name: 'Dividends Payable', type: 'liability', subtype: 'Current Liability' },

  // --- Equity (NA001–NA003) ---
  { code: '3000', name: 'Share Capital', type: 'equity', subtype: 'Equity' },
  { code: '3100', name: 'Retained Earnings', type: 'equity', subtype: 'Equity' },
  { code: '3200', name: 'Current Year Profit/Loss', type: 'equity', subtype: 'Equity' },

  // --- Revenue (I001–I007) ---
  { code: '4000', name: 'Sales Revenue', type: 'revenue', subtype: 'Operating Revenue' },
  { code: '4010', name: 'Commission Income', type: 'revenue', subtype: 'Operating Revenue' },
  { code: '4020', name: 'Consulting Income', type: 'revenue', subtype: 'Operating Revenue' },
  { code: '4030', name: 'Interest Income', type: 'revenue', subtype: 'Other Income' },
  { code: '4040', name: 'Other Revenue', type: 'revenue', subtype: 'Operating Revenue' },
  { code: '4050', name: 'Profit on Sale of Asset', type: 'revenue', subtype: 'Other Income' },
  { code: '4060', name: 'Recoveries', type: 'revenue', subtype: 'Other Income' },

  // --- Expenditure (E001–E039) ---
  // Cost of Sales
  { code: '5000', name: 'Cost of Sales', type: 'expense', subtype: 'COGS' },
  { code: '5100', name: 'Opening Stock', type: 'expense', subtype: 'COGS' },
  { code: '5200', name: 'Purchases', type: 'expense', subtype: 'COGS' },
  { code: '5300', name: 'Closing Stock', type: 'expense', subtype: 'COGS' },
  
  // Operating Expenses
  { code: '6000', name: 'Office Supplies', type: 'expense', subtype: 'Operating Expense' },
  { code: '6010', name: 'Salaries and Wages', type: 'expense', subtype: 'HR' },
  { code: '6020', name: 'Utilities', type: 'expense', subtype: 'Operating Expense' },
  { code: '6030', name: 'Rent', type: 'expense', subtype: 'Operating Expense' },
  { code: '6040', name: 'Insurance', type: 'expense', subtype: 'Operating Expense' },
  { code: '6050', name: 'Marketing', type: 'expense', subtype: 'Operating Expense' },
  { code: '6060', name: 'Professional Services', type: 'expense', subtype: 'Operating Expense' },
  { code: '6070', name: 'Depreciation', type: 'expense', subtype: 'Depreciation' },
  { code: '6080', name: 'SARS/Tax Penalties', type: 'expense', subtype: 'SARS/Tax' },
  { code: '6090', name: 'Bank Charges', type: 'expense', subtype: 'Operating Expense' },
  { code: '6100', name: 'Cleaning', type: 'expense', subtype: 'Operating Expense' },
  { code: '6110', name: 'Computer Expenses', type: 'expense', subtype: 'Operating Expense' },
  { code: '6120', name: 'Consulting Fees', type: 'expense', subtype: 'Operating Expense' },
  { code: '6130', name: 'Courier and Postage', type: 'expense', subtype: 'Operating Expense' },
  { code: '6140', name: 'Donations', type: 'expense', subtype: 'Operating Expense' },
  { code: '6150', name: 'Electricity and Water', type: 'expense', subtype: 'Operating Expense' },
  { code: '6160', name: 'Entertainment', type: 'expense', subtype: 'Operating Expense' },
  { code: '6170', name: 'General Expenses', type: 'expense', subtype: 'Operating Expense' },
  { code: '6180', name: 'Internet and Telephone', type: 'expense', subtype: 'Operating Expense' },
  { code: '6190', name: 'Legal Fees', type: 'expense', subtype: 'Operating Expense' },
  { code: '6200', name: 'Motor Vehicle Expenses', type: 'expense', subtype: 'Operating Expense' },
  { code: '6210', name: 'Printing and Stationery', type: 'expense', subtype: 'Operating Expense' },
  { code: '6220', name: 'Repairs and Maintenance', type: 'expense', subtype: 'Operating Expense' },
  { code: '6230', name: 'Security', type: 'expense', subtype: 'Operating Expense' },
  { code: '6240', name: 'Staff Training', type: 'expense', subtype: 'HR' },
  { code: '6250', name: 'Staff Welfare', type: 'expense', subtype: 'HR' },
  { code: '6260', name: 'Subscriptions', type: 'expense', subtype: 'Operating Expense' },
  { code: '6270', name: 'Travel - Local', type: 'expense', subtype: 'Operating Expense' },
  { code: '6280', name: 'Travel - Overseas', type: 'expense', subtype: 'Operating Expense' },
  { code: '6290', name: 'Workmen\'s Compensation', type: 'expense', subtype: 'HR' },
];

const TABLE_NAME = 'chart_of_accounts';

const getCompanyId = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', userId)
    .single();
  return data?.company_id;
};

export const chartOfAccountsApi = {
  getAccounts: async (companyId?: string): Promise<Account[]> => {
    try {
      if (!companyId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        companyId = await getCompanyId(user.id);
      }
      
      if (!companyId) return [];

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('company_id', companyId)
        .order('code', { ascending: true });

      if (error) throw error;

      // If no accounts found, seed default
      if (!data || data.length === 0) {
         await chartOfAccountsApi.seedDefaultSAChart(companyId);
         // Refetch
         const { data: refetched } = await supabase
           .from(TABLE_NAME)
           .select('*')
           .eq('company_id', companyId)
           .order('code', { ascending: true });
         return (refetched as unknown as Account[]) || [];
      }

      return (data as unknown as Account[]) || [];
    } catch (err) {
      console.error('Error fetching COA:', err);
      return [];
    }
  },

  saveAccount: async (account: Omit<Account, 'id'>): Promise<Account | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const companyId = await getCompanyId(user.id);
      if (!companyId) throw new Error('No company found');

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([{ ...account, company_id: companyId }])
        .select()
        .single();
      
      if (error) throw error;

      await auditLogger.log({
          action: 'CREATE_ACCOUNT',
          entityType: 'account',
          entityId: data.id,
          details: { code: data.code, name: data.name }
      });

      return data as unknown as Account;
    } catch (err) {
      console.error('Error saving account:', err);
      return null;
    }
  },
  
  updateAccount: async (updatedAccount: Account): Promise<void> => {
      try {
        const { error } = await supabase
          .from(TABLE_NAME)
          .update({
            name: updatedAccount.name,
            type: updatedAccount.type,
            subtype: updatedAccount.subtype,
            isActive: updatedAccount.isActive,
            description: updatedAccount.description
          })
          .eq('id', updatedAccount.id);
        
        if (error) throw error;

        await auditLogger.log({
            action: 'UPDATE_ACCOUNT',
            entityType: 'account',
            entityId: updatedAccount.id,
            details: { name: updatedAccount.name, code: updatedAccount.code }
        });
      } catch (err) {
        console.error('Error updating account:', err);
      }
  },

  // Soft-deactivate account; protect core accounts
  deleteAccount: async (id: string): Promise<void> => {
      try {
        const { data: account } = await supabase
          .from(TABLE_NAME)
          .select('code')
          .eq('id', id)
          .single();
        
        if (!account) return;

        const protectedCodes = new Set(['1000', '1100', '2000', '3000', '4000']);
        if (protectedCodes.has(account.code)) {
          return; // Protected
        }

        const { error } = await supabase
          .from(TABLE_NAME)
          .update({ isActive: false })
          .eq('id', id);

        if (error) throw error;

        await auditLogger.log({
            action: 'DELETE_ACCOUNT',
            entityType: 'account',
            entityId: id,
            details: { code: account.code, name: account.name }
        });
      } catch (err) {
        console.error('Error deleting account:', err);
      }
  },

  // Seed missing accounts from SA_CHART_OF_ACCOUNTS
  seedDefaultSAChart: async (companyId: string): Promise<number> => {
    try {
      // Fetch existing codes to avoid duplicates
      const { data: existing } = await supabase
        .from(TABLE_NAME)
        .select('code')
        .eq('company_id', companyId);
      
      const existingCodes = new Set(existing?.map((a: any) => a.code) || []);
      
      const toInsert = SA_CHART_OF_ACCOUNTS
        .filter(a => !existingCodes.has(a.code))
        .map(a => ({
          ...a,
          company_id: companyId,
          isActive: true
        }));
      
      if (toInsert.length === 0) return 0;

      const { error } = await supabase
        .from(TABLE_NAME)
        .insert(toInsert);
      
      if (error) throw error;
      
      return toInsert.length;
    } catch (err) {
      console.error('Error seeding COA:', err);
      return 0;
    }
  }
};
