
import { v4 as uuidv4 } from 'uuid';

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'unmatched' | 'matched' | 'flagged';
  matchedId?: string;
  bankName?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string; // e.g. 'Capitec', 'FNB'
  balance: number;
  lastSynced: string;
  status: 'connected' | 'disconnected' | 'error';
}

const STORAGE_KEY_ACCOUNTS = 'rigel_bank_accounts';
const STORAGE_KEY_TRANSACTIONS = 'rigel_bank_transactions';

export const bankingService = {
  // Simulate connecting a bank account
  async connectBank(bankName: string): Promise<BankAccount> {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

    const newAccount: BankAccount = {
      id: uuidv4(),
      name: `${bankName} Business Account`,
      accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      bankName,
      balance: Math.floor(50000 + Math.random() * 200000), // Random balance between 50k and 250k
      lastSynced: new Date().toISOString(),
      status: 'connected'
    };

    const accounts = await this.getConnectedAccounts();
    accounts.push(newAccount);
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));

    // Generate initial transactions for this account
    await this.generateMockTransactions(newAccount.id);

    return newAccount;
  },

  async getConnectedAccounts(): Promise<BankAccount[]> {
    const stored = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    return stored ? JSON.parse(stored) : [];
  },

  async getTransactions(accountId: string): Promise<BankTransaction[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    const allTransactions: BankTransaction[] = stored ? JSON.parse(stored) : [];
    // In a real app, we'd filter by accountId, but for now we'll just return all or filter if we added accountId to tx
    // For simplicity, let's assume we just return all for the demo
    return allTransactions;
  },

  async generateMockTransactions(accountId: string) {
    const descriptions = [
      'Office Supplies', 'Client Payment', 'Service Fee', 'Monthly Rent', 
      'Internet Service', 'Software Subscription', 'Consulting Fee', 'Utility Bill'
    ];

    const newTransactions: BankTransaction[] = Array.from({ length: 10 }).map(() => {
      const isCredit = Math.random() > 0.5;
      return {
        id: uuidv4(),
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        amount: Number((Math.random() * 5000).toFixed(2)),
        type: isCredit ? 'credit' : 'debit',
        status: 'unmatched',
        bankName: 'Simulated Bank'
      };
    });

    const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    const current = stored ? JSON.parse(stored) : [];
    const updated = [...current, ...newTransactions];
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
  },

  async syncAccount(accountId: string): Promise<BankTransaction[]> {
    // Simulate fetching new transactions
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.generateMockTransactions(accountId);
    return this.getTransactions(accountId);
  }
};
