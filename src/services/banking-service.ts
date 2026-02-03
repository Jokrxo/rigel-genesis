
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

// Heuristic account mapping based on transaction description and type
export function suggestAccountMapping(tx: BankTransaction, accounts: Array<{ code: string; name: string; type: string }>) {
  const desc = tx.description.toLowerCase();
  const findByName = (keywords: string[]) => accounts.find(a => keywords.some(k => a.name.toLowerCase().includes(k)));
  const findByCode = (code: string) => accounts.find(a => a.code === code);

  let debit: { code: string; name: string } | undefined;
  let credit: { code: string; name: string } | undefined;

  if (tx.type === 'debit') {
    if (desc.includes('salary') || desc.includes('payroll')) {
      debit = findByName(['salaries', 'wages']) || findByCode('6010');
      credit = findByCode('1000');
    } else if (desc.includes('vat')) {
      debit = findByName(['vat receivable']) || findByCode('1300');
      credit = findByCode('1000');
    } else if (desc.includes('rent')) {
      debit = findByName(['rent']) || findByCode('6030');
      credit = findByCode('1000');
    } else if (desc.includes('utilities') || desc.includes('electric') || desc.includes('water')) {
      debit = findByName(['utilities']) || findByCode('6020');
      credit = findByCode('1000');
    } else if (desc.includes('insurance')) {
      debit = findByName(['insurance']) || findByCode('6040');
      credit = findByCode('1000');
    } else {
      debit = findByName(['office supplies']) || findByCode('6000');
      credit = findByCode('1000');
    }
  } else {
    if (desc.includes('pos') || desc.includes('sale') || desc.includes('payment received')) {
      debit = findByCode('1000');
      credit = findByName(['sales revenue']) || findByCode('4000');
    } else if (desc.includes('interest')) {
      debit = findByCode('1000');
      credit = findByName(['interest income']) || findByCode('4030');
    } else if (desc.includes('vat')) {
      debit = findByCode('1000');
      credit = findByName(['vat payable']) || findByCode('2200');
    } else {
      debit = findByCode('1000');
      credit = findByName(['other revenue']) || findByCode('4040');
    }
  }

  return {
    debit,
    credit,
  };
}
