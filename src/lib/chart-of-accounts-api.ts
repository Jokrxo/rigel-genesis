
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

  deleteAccount: async (id: string): Promise<void> => {
      const accounts = await chartOfAccountsApi.getAccounts();
      const filtered = accounts.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
