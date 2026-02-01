export interface JournalEntry {
  id: string;
  user_id: string;
  entry_number: string;
  reference: string | null;
  date: string;
  description: string | null;
  status: 'draft' | 'posted';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: string;
  entry_id: string;
  account_id: string; // This might be a text field or UUID depending on implementation
  description: string | null;
  debit: number;
  credit: number;
  created_at: string;
}
