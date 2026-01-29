
import { v4 as uuidv4 } from 'uuid';

export interface JournalLine {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  status: 'draft' | 'posted';
  type?: 'standard' | 'adjustment';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  lines: JournalLine[];
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = 'rigel_journal_entries';

export const journalApi = {
  async getEntries(): Promise<JournalEntry[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // Return default demo data if nothing stored
        return [
            {
              id: "1",
              date: "2024-01-15",
              reference: "JE-2024-001",
              description: "Monthly Rent Accrual",
              status: "posted",
              type: "standard",
              approvalStatus: "approved",
              lines: [
                { id: "1", accountId: "6000", description: "Rent Expense", debit: 5000, credit: 0 },
                { id: "2", accountId: "2000", description: "Accrued Expenses", debit: 0, credit: 5000 }
              ],
              created_at: new Date().toISOString()
            },
            {
              id: "2",
              date: "2024-12-31",
              reference: "ADJ-2024-001",
              description: "Year-End Depreciation",
              status: "draft",
              type: "adjustment",
              approvalStatus: "pending",
              lines: [
                { id: "1", accountId: "6000", description: "Depreciation Expense", debit: 1200, credit: 0 },
                { id: "2", accountId: "1500", description: "Accumulated Depreciation", debit: 0, credit: 1200 }
              ],
              created_at: new Date().toISOString()
            }
        ];
    }
    return JSON.parse(stored);
  },

  async getEntryById(id: string): Promise<JournalEntry | null> {
    const entries = await this.getEntries();
    return entries.find(e => e.id === id) || null;
  },

  async createEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<JournalEntry> {
    const entries = await this.getEntries();
    
    const newEntry: JournalEntry = {
      ...entry,
      id: uuidv4(),
      status: 'draft', // Always draft initially
      type: entry.type || 'standard',
      approvalStatus: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    entries.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const entries = await this.getEntries();
    const index = entries.findIndex(e => e.id === id);
    
    if (index === -1) throw new Error('Entry not found');
    
    const current = entries[index];
    if (current.status === 'posted') {
        throw new Error('Cannot edit posted entries');
    }
    
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    entries[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return updated;
  },

  async deleteEntry(id: string): Promise<boolean> {
    const entries = await this.getEntries();
    const index = entries.findIndex(e => e.id === id);
    
    if (index === -1) throw new Error('Entry not found');
    if (entries[index].status === 'posted') {
        throw new Error('Cannot delete posted entries');
    }
    
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },
  
  async postEntry(id: string): Promise<JournalEntry> {
      const entries = await this.getEntries();
      const index = entries.findIndex(e => e.id === id);
      
      if (index === -1) throw new Error('Entry not found');
      
      // Validate balance
      const entry = entries[index];
      const totalDebit = entry.lines.reduce((sum, line) => sum + Number(line.debit), 0);
      const totalCredit = entry.lines.reduce((sum, line) => sum + Number(line.credit), 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
          throw new Error('Entry is not balanced');
      }
      
      const updated = { ...entry, status: 'posted' as const, updated_at: new Date().toISOString() };
      entries[index] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return updated;
  }
};
