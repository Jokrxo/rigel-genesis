
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/lib/audit-logger';

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
  company_id?: string;
}

// Helper to get company_id
const getCompanyId = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', userId)
    .single();
  return data?.company_id;
};

export const journalApi = {
  async getEntries(companyId?: string): Promise<JournalEntry[]> {
    let query = supabase
      .from('journal_entries')
      .select(`
        *,
        lines:journal_entry_lines(
          id,
          account_id,
          description,
          debit,
          credit
        )
      `)
      .order('date', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((entry: any) => ({
      id: entry.id,
      date: entry.date,
      reference: entry.reference,
      description: entry.description,
      status: entry.status,
      type: entry.type || 'standard',
      approvalStatus: entry.approval_status || 'pending',
      lines: (entry.lines || []).map((line: any) => ({
        id: line.id,
        accountId: line.account_id,
        description: line.description || '',
        debit: Number(line.debit),
        credit: Number(line.credit)
      })),
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      company_id: entry.company_id
    }));
  },

  async getEntryById(id: string): Promise<JournalEntry | null> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        lines:journal_entry_lines(
          id,
          account_id,
          description,
          debit,
          credit
        )
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      id: data.id,
      date: data.date,
      reference: data.reference,
      description: data.description,
      status: data.status,
      type: data.type || 'standard',
      approvalStatus: data.approval_status || 'pending',
      lines: (data.lines || []).map((line: any) => ({
        id: line.id,
        accountId: line.account_id,
        description: line.description || '',
        debit: Number(line.debit),
        credit: Number(line.credit)
      })),
      created_at: data.created_at,
      updated_at: data.updated_at,
      company_id: data.company_id
    };
  },

  async createEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<JournalEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const company_id = await getCompanyId(user.id);
    if (!company_id) throw new Error('Company not found');

    const linesForRpc = entry.lines.map(line => ({
      accountId: line.accountId,
      description: line.description,
      debit: line.debit,
      credit: line.credit
    }));

    const { data, error } = await supabase.rpc('create_journal_entry', {
      p_user_id: user.id,
      p_company_id: company_id,
      p_date: entry.date,
      p_reference: entry.reference,
      p_description: entry.description,
      p_type: entry.type || 'standard',
      p_lines: linesForRpc,
      p_status: 'draft'
    });

    if (error) throw error;

    // Return the created entry (fetching it to be sure)
    const newEntry = await this.getEntryById(data.id);
    if (!newEntry) throw new Error('Failed to retrieve created entry');

    await auditLogger.log({
      action: 'CREATE_JOURNAL_ENTRY',
      entityType: 'journal_entry',
      entityId: newEntry.id,
      details: { reference: newEntry.reference, description: newEntry.description }
    });

    return newEntry;
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // If lines are updated, we must use the RPC or handle delete/insert manually.
    // Since updateEntry takes Partial<JournalEntry>, checking if lines are present.
    // If lines are present, we should probably use a full update RPC or similar logic.
    // The current UI sends the full object usually when editing.
    
    // For simplicity, if lines are present, use the update RPC.
    // If lines are NOT present, maybe just update the header fields?
    // But update_journal_entry RPC expects all fields.
    // Let's fetch the existing entry first if we need to merge.
    
    const existing = await this.getEntryById(id);
    if (!existing) throw new Error('Entry not found');

    if (existing.status === 'posted' && updates.status !== 'posted') { 
        // Allow unposting? Or maybe updates are restricted.
        // The previous code said "Cannot edit posted entries".
        if (updates.status === undefined) {
             throw new Error('Cannot edit posted entries');
        }
    }
    
    // If only approval status is changing (e.g. approve/reject)
    if (updates.approvalStatus && Object.keys(updates).length === 1) {
        const { error } = await supabase
            .from('journal_entries')
            .update({ approval_status: updates.approvalStatus })
            .eq('id', id);
        if (error) throw error;

        await auditLogger.log({
            action: updates.approvalStatus === 'approved' ? 'APPROVE_JOURNAL_ENTRY' : 
                   updates.approvalStatus === 'rejected' ? 'REJECT_JOURNAL_ENTRY' : 'UPDATE_JOURNAL_ENTRY',
            entityType: 'journal_entry',
            entityId: id,
            details: { reference: existing.reference, status: updates.approvalStatus }
        });

        return { ...existing, approvalStatus: updates.approvalStatus };
    }

    // Full update using RPC
    const linesForRpc = (updates.lines || existing.lines).map(line => ({
      accountId: line.accountId,
      description: line.description,
      debit: line.debit,
      credit: line.credit
    }));

    const { data, error } = await supabase.rpc('update_journal_entry', {
      p_entry_id: id,
      p_user_id: user.id,
      p_date: updates.date || existing.date,
      p_reference: updates.reference || existing.reference,
      p_description: updates.description || existing.description,
      p_type: updates.type || existing.type || 'standard',
      p_lines: linesForRpc,
      p_status: updates.status || existing.status
    });

    if (error) throw error;

    const updatedEntry = await this.getEntryById(id);
    if (!updatedEntry) throw new Error('Failed to retrieve updated entry');

    await auditLogger.log({
        action: 'UPDATE_JOURNAL_ENTRY',
        entityType: 'journal_entry',
        entityId: id,
        details: { reference: updatedEntry.reference, description: updatedEntry.description }
    });

    return updatedEntry;
  },

  async deleteEntry(id: string): Promise<boolean> {
    const entry = await this.getEntryById(id);

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (entry) {
        await auditLogger.log({
            action: 'DELETE_JOURNAL_ENTRY',
            entityType: 'journal_entry',
            entityId: id,
            details: { reference: entry.reference, description: entry.description }
        });
    }

    return true;
  },
  
  async postEntry(id: string): Promise<JournalEntry> {
    // Validate balance before posting?
    // The RPC or backend should handle this ideally, but we can do it here or assume valid.
    // Let's update status to 'posted'.
    
    // Check balance first
    const entry = await this.getEntryById(id);
    if (!entry) throw new Error('Entry not found');

    const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Entry is not balanced');
    }

    const { error } = await supabase
      .from('journal_entries')
      .update({ status: 'posted', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    
    await auditLogger.log({
      action: 'POST_JOURNAL_ENTRY',
      entityType: 'journal_entry',
      entityId: id,
      details: { reference: entry.reference }
    });

    return { ...entry, status: 'posted' };
  }
};
