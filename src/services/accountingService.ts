import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { Invoice } from '@/types/sales';

// Some deployments may not include all optional accounting tables in generated types.
// Cast to avoid TypeScript failing the entire build.
const supabase: any = supabaseClient;

// Constants matching the seeded Chart of Accounts
export const ACCOUNT_CODES = {
  // Assets
  INVENTORY: '1100',
  TRADE_RECEIVABLES: '1200', // Debtors Control
  BANK_MAIN: '1310',
  
  // Liabilities
  TRADE_PAYABLES: '3100', // Creditors Control
  VAT_PAYABLE: '3200',    // Output VAT
  
  // Income
  SALES_REVENUE: '4000',
  
  // Expenses
  COST_OF_GOODS_SOLD: '5000',
} as const;

export interface JournalEntryLineInput {
  account_code: string;
  description?: string;
  debit: number;
  credit: number;
}

export interface JournalEntryInput {
  date: string;
  reference?: string;
  description?: string;
  lines: JournalEntryLineInput[];
  related_document_id?: string;
  related_document_type?: string;
}

export class AccountingService {
  /**
   * Get an account by its code.
   */
  static async getAccountByCode(code: string) {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      console.error(`Error fetching account ${code}:`, error);
      return null;
    }
    return data;
  }

  /**
   * Create a balanced journal entry.
   */
  static async createJournalEntry(entry: JournalEntryInput) {
    // 1. Validate balance
    const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

    // Allow for small floating point differences
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Journal entry is not balanced. Debits: ${totalDebit}, Credits: ${totalCredit}`);
    }

    // 2. Get User ID (required for RLS)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 3. Resolve Account Codes to UUIDs
    const resolvedLines = await Promise.all(entry.lines.map(async (line) => {
      const account = await this.getAccountByCode(line.account_code);
      if (!account) throw new Error(`Account code ${line.account_code} not found`);
      return {
        ...line,
        account_id: account.id
      };
    }));

    // 4. Insert Journal Entry Header
    const { data: journalEntry, error: journalError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        date: entry.date,
        reference: entry.reference,
        description: entry.description,
        status: 'posted', // Auto-post for now
        total_amount: totalDebit,
        related_document_id: entry.related_document_id,
        related_document_type: entry.related_document_type
      })
      .select()
      .single();

    if (journalError) throw journalError;

    // 5. Insert Journal Entry Lines
    const linesToInsert = resolvedLines.map(line => ({
      journal_entry_id: journalEntry.id,
      account_id: line.account_id,
      description: line.description || entry.description,
      debit: line.debit,
      credit: line.credit
    }));

    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(linesToInsert);

    if (linesError) {
      // Rollback header if lines fail? Supabase doesn't support multi-table transactions easily via JS client 
      // without RPC. Ideally this should be an RPC. For now we just throw.
      console.error('Error inserting journal lines:', linesError);
      // Try to delete the header to clean up (best effort)
      await supabase.from('journal_entries').delete().eq('id', journalEntry.id);
      throw linesError;
    }

    return journalEntry;
  }

  /**
   * Post an Invoice to the General Ledger.
   * Dr Trade Receivables (Total)
   * Cr Sales Revenue (Subtotal)
   * Cr VAT Payable (VAT)
   */
  static async postInvoice(invoice: Invoice) {
    console.log('Posting invoice to GL:', invoice.document_number);
    
    // Ensure numbers are numbers
    const total = Number(invoice.grand_total);
    const subtotal = Number(invoice.subtotal);
    const vat = Number(invoice.vat_total);

    const lines: JournalEntryLineInput[] = [
      // Debit Debtors (Asset)
      {
        account_code: ACCOUNT_CODES.TRADE_RECEIVABLES,
        description: `Invoice ${invoice.document_number} - Customer ${invoice.customer?.name || 'Unknown'}`,
        debit: total,
        credit: 0
      },
      // Credit Sales (Income)
      {
        account_code: ACCOUNT_CODES.SALES_REVENUE,
        description: `Sales Revenue - Invoice ${invoice.document_number}`,
        debit: 0,
        credit: subtotal
      },
      // Credit VAT (Liability)
      {
        account_code: ACCOUNT_CODES.VAT_PAYABLE,
        description: `VAT Output - Invoice ${invoice.document_number}`,
        debit: 0,
        credit: vat
      }
    ];

    // TODO: Handle Cost of Goods Sold if inventory items are present
    // This would require checking line items for product IDs and cost prices.

    await this.createJournalEntry({
      date: invoice.document_date || new Date().toISOString(),
      reference: invoice.document_number,
      description: `Invoice #${invoice.document_number}`,
      lines,
      related_document_id: invoice.id,
      related_document_type: 'invoice'
    });
  }
}
