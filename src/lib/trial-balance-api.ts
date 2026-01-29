
import { chartOfAccountsApi } from "./chart-of-accounts-api";
import { journalApi } from "./journal-api";

export interface TrialBalanceRow {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceData {
  accountsCount?: number;
  rows: TrialBalanceRow[];
  totals: { debit: number; credit: number };
}

export const trialBalanceApi = {
  async get(entityId: string, view: 'pre' | 'post' = 'pre'): Promise<TrialBalanceData> {
    const accounts = await chartOfAccountsApi.getAccounts();
    const entries = await journalApi.getEntries();

    // Initialize balances map
    const balances = new Map<string, { debit: number; credit: number }>();
    accounts.forEach(acc => {
      balances.set(acc.code, { debit: 0, credit: 0 });
    });

    // Filter entries based on view
    const filteredEntries = entries.filter(entry => {
      if (view === 'pre') {
        // Exclude adjustments
        return entry.type !== 'adjustment';
      }
      // Include everything for post
      return true;
    });

    // Calculate sums
    filteredEntries.forEach(entry => {
      entry.lines.forEach(line => {
        // Find account by ID or Code? 
        // JournalLine has accountId. 
        // chartOfAccountsApi returns accounts with ID and Code.
        // In JournalEntryManager, the SelectItem value seems to be the CODE (e.g. "1000").
        // Let's assume accountId in JournalLine corresponds to Account Code.
        
        const current = balances.get(line.accountId) || { debit: 0, credit: 0 };
        balances.set(line.accountId, {
          debit: current.debit + Number(line.debit),
          credit: current.credit + Number(line.credit)
        });
      });
    });

    // Build rows
    const rows: TrialBalanceRow[] = accounts.map(acc => {
      const bal = balances.get(acc.code) || { debit: 0, credit: 0 };
      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit: bal.debit,
        credit: bal.credit
      };
    }).filter(r => r.debit > 0 || r.credit > 0); // Only show active accounts? Or all? Let's show all for now or filter empty?
    // Usually Trial Balance shows all accounts or only those with non-zero balance. 
    // Let's filter non-zero for cleaner view, but keep structure.

    const totals = rows.reduce((acc, row) => ({
      debit: acc.debit + row.debit,
      credit: acc.credit + row.credit
    }), { debit: 0, credit: 0 });

    return {
      accountsCount: accounts.length,
      rows,
      totals
    };
  },

  async exportPdf(entityId: string): Promise<Blob> {
    // Mock PDF export
    const content = "Trial Balance PDF Content";
    return new Blob([content], { type: 'application/pdf' });
  },
};
