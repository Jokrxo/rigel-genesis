
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { auditLogger } from "@/lib/audit-logger";

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'unmatched' | 'matched' | 'flagged';
  matchedId?: string;
  bankName?: string;
  bank_account_id?: string;
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

export const bankingService = {
  // Simulate connecting a bank account
  async connectBank(bankName: string): Promise<BankAccount> {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.company_id) throw new Error("No company linked to user");

    const newAccount = {
      company_id: profile.company_id,
      name: `${bankName} Business Account`,
      account_number: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      bank_name: bankName,
      balance: Math.floor(50000 + Math.random() * 200000), // Random balance between 50k and 250k
      status: 'connected',
      last_synced: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(newAccount)
      .select()
      .single();

    if (error) throw error;

    await auditLogger.log({
      action: 'CONNECT_BANK',
      entityType: 'bank_account',
      entityId: data.id,
      details: { bank_name: bankName, account_number: newAccount.account_number }
    });

    // Generate initial transactions for this account
    await this.generateMockTransactions(data.id, profile.company_id, bankName);

    return {
      id: data.id,
      name: data.name,
      accountNumber: data.account_number,
      bankName: data.bank_name,
      balance: data.balance,
      lastSynced: data.last_synced,
      status: data.status as BankAccount['status']
    };
  },

  async getConnectedAccounts(): Promise<BankAccount[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.company_id) return [];

    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('company_id', profile.company_id);

    if (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    }

    return data.map(acc => ({
      id: acc.id,
      name: acc.name,
      accountNumber: acc.account_number,
      bankName: acc.bank_name,
      balance: acc.balance,
      lastSynced: acc.last_synced,
      status: acc.status as BankAccount['status']
    }));
  },

  async getTransactions(accountId: string): Promise<BankTransaction[]> {
    const { data, error } = await supabase
      .from('bank_transactions')
      .select('*, bank_accounts(bank_name)')
      .eq('bank_account_id', accountId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data.map(tx => ({
      id: tx.id,
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      type: tx.type as 'debit' | 'credit',
      status: tx.status as BankTransaction['status'],
      matchedId: tx.matched_id,
      bankName: tx.bank_accounts?.bank_name,
      bank_account_id: tx.bank_account_id
    }));
  },

  async generateMockTransactions(accountId: string, companyId?: string, bankName?: string) {
    if (!companyId) {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
       const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
       if (!profile?.company_id) return;
       companyId = profile.company_id;
    }

    const descriptions = [
      'Office Supplies', 'Client Payment', 'Service Fee', 'Monthly Rent', 
      'Internet Service', 'Software Subscription', 'Consulting Fee', 'Utility Bill'
    ];

    const newTransactions = Array.from({ length: 10 }).map(() => {
      const isCredit = Math.random() > 0.5;
      return {
        company_id: companyId,
        bank_account_id: accountId,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        amount: Number((Math.random() * 5000).toFixed(2)),
        type: isCredit ? 'credit' : 'debit',
        status: 'unmatched',
      };
    });

    const { error } = await supabase
      .from('bank_transactions')
      .insert(newTransactions);
      
    if (error) console.error("Error generating mock transactions:", error);
  },

  async syncAccount(accountId: string): Promise<BankTransaction[]> {
    // Simulate fetching new transactions
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.generateMockTransactions(accountId);
    return this.getTransactions(accountId);
  },

  async matchTransaction(bankTxId: string, systemTxId: string) {
    try {
      const { data, error } = await supabase
        .from('bank_transactions')
        .update({ status: 'matched', matched_id: systemTxId })
        .eq('id', bankTxId)
        .select()
        .single();

      if (error) throw error;

      await auditLogger.log({
        action: 'MATCH_TRANSACTION',
        entityType: 'bank_transaction',
        entityId: bankTxId,
        details: { matched_system_tx_id: systemTxId }
      });

      return data;
    } catch (error) {
      console.error('Error matching transaction:', error);
      throw error;
    }
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
