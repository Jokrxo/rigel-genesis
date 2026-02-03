import { supabase } from "@/integrations/supabase/client";
import { SalesDocument } from "@/types/sales";

export const postInvoice = async (document: SalesDocument) => {
  // 1. Fetch line items to calculate totals (if not passed)
  // For simplicity, we assume document has totals correct.
  
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");

  // 2. Create Journal Entry Header
  const { data: entry, error: entryError } = await (supabase
    .from('journal_entries') as any)
    .insert({
      user_id: user.user.id,
      reference: document.document_number,
      entry_date: document.document_date,
      description: `Invoice ${document.document_number} Posted`,
      status: 'posted',
      total_debit: document.grand_total,
      total_credit: document.grand_total,
    })
    .select()
    .single();

  if (entryError) throw entryError;

  // 3. Create Journal Entry Lines
  // Simplistic accounting:
  // Dr Accounts Receivable (Total)
  // Cr Sales Revenue (Subtotal)
  // Cr VAT Payable (Tax)

  const lines = [
    {
      journal_entry_id: entry.id,
      account_id: '1100',
      description: `Invoice ${document.document_number} - AR`,
      debit: document.grand_total,
      credit: 0,
    },
    {
      journal_entry_id: entry.id,
      account_id: '4000',
      description: `Invoice ${document.document_number} - Revenue`,
      debit: 0,
      credit: document.subtotal,
    }
  ];

  if (document.vat_total > 0) {
    lines.push({
      journal_entry_id: entry.id,
      account_id: '2200',
      description: `Invoice ${document.document_number} - VAT`,
      debit: 0,
      credit: document.vat_total,
    });
  }

  const { error: linesError } = await (supabase
    .from('journal_entry_lines') as any)
    .insert(lines);

  if (linesError) {
    // Rollback header? Supabase doesn't support transactions easily in client client-side.
    // Ideally this should be an RPC or Edge Function.
    console.error("Failed to create journal lines", linesError);
    throw linesError;
  }

  // 4. Update Document Status
  const { error: updateError } = await supabase
    .from('sales_documents')
    .update({ status: 'posted' })
    .eq('id', document.id);

  if (updateError) throw updateError;

  return entry;
};
