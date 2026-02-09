import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AccountingService } from '@/services/accountingService';
import { auditLogger } from '@/lib/audit-logger';
import type { Customer, SalesDocument, Receipt, CustomerStats, AgingSummary, Invoice } from '@/types/sales';

// Generate document numbers
const generateDocNumber = (prefix: string, count: number): string => {
  const year = new Date().getFullYear();
  const num = String(count + 1).padStart(3, '0');
  return `${prefix}-${year}-${num}`;
};

// Generate customer code
const generateCustomerCode = (count: number): string => {
  return `CUST-${String(count + 1).padStart(4, '0')}`;
};

// Helper to get company_id
const getCompanyId = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', userId)
    .single();
  return data?.company_id;
};

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CustomerStats>({
    total_customers: 0,
    active_customers: 0,
    total_receivables: 0,
    overdue_amount: 0,
  });
  const { toast } = useToast();

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const company_id = await getCompanyId(user.id);
      if (!company_id) throw new Error('Company not found');

      // Try Supabase first with resilient select
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', company_id);
      
      if (error) {
        throw error;
      } else {
        setCustomers((data || []) as Customer[]);
        calculateStats((data || []) as Customer[], company_id);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      toast({ title: 'Error', description: 'Failed to load customers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const calculateStats = async (customerList: Customer[], companyId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!companyId) {
        companyId = await getCompanyId(user.id);
      }

      const { data: invoices, error } = await supabase
        .from('sales_documents')
        .select('due_date, total_amount, amount_paid, status')
        .eq('document_type', 'invoice')
        .eq('company_id', companyId)
        .neq('status', 'cancelled');

      if (error) throw error;
      
      const now = new Date();
      
      let totalReceivables = 0;
      let overdueAmount = 0;
      
      (invoices || []).forEach(inv => {
        if (inv.status !== 'paid') {
          const amountDue = (inv.total_amount || 0) - (inv.amount_paid || 0);
          totalReceivables += amountDue;
          if (new Date(inv.due_date) < now) {
            overdueAmount += amountDue;
          }
        }
      });

      setStats({
        total_customers: customerList.length,
        active_customers: customerList.filter(c => c.is_active).length,
        total_receivables: totalReceivables,
        overdue_amount: overdueAmount,
      });
    } catch (err) {
      console.error('Error calculating customer stats:', err);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'customer_code' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Customer | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const company_id = await getCompanyId(user.id);
      if (!company_id) throw new Error('Company not found');

      const newCustomer: Customer = {
        ...customerData,
        id: crypto.randomUUID(),
        customer_code: generateCustomerCode(customers.length),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
        company_id: company_id
      };

      // Try Supabase first
      const { error } = await supabase.from('customers').insert(newCustomer);
      
      if (error) {
         throw error;
      }

      setCustomers(prev => [...prev, newCustomer]);
      toast({ title: 'Success', description: 'Customer created successfully' });
      
      await auditLogger.log({
        action: 'CREATE_CUSTOMER',
        entityType: 'customer',
        entityId: newCustomer.id,
        details: { customer_code: newCustomer.customer_code, name: newCustomer.customer_name }
      });

      return newCustomer;
    } catch (err) {
      console.error('Error creating customer:', err);
      toast({ title: 'Error', description: 'Failed to create customer', variant: 'destructive' });
      return null;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updatedData = { ...updates, updated_at: new Date().toISOString() };

      const { error } = await supabase.from('customers').update(updatedData).eq('id', id);
      
      if (error) {
        throw error;
      }

      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
      toast({ title: 'Success', description: 'Customer updated successfully' });
      return true;
    } catch (err) {
      console.error('Error updating customer:', err);
      toast({ title: 'Error', description: 'Failed to update customer', variant: 'destructive' });
      return false;
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('customers').delete().eq('id', id);
      
      if (error) {
        throw error;
      }

      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Success', description: 'Customer deleted successfully' });

      await auditLogger.log({
        action: 'DELETE_CUSTOMER',
        entityType: 'customer',
        entityId: id
      });

      return true;
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast({ title: 'Error', description: 'Failed to delete customer', variant: 'destructive' });
      return false;
    }
  };

  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(c => c.id === id);
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    stats,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
  };
}

export function useSalesDocuments(documentType?: 'quotation' | 'invoice' | 'credit_note') {
  const [documents, setDocuments] = useState<SalesDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const storageKey = documentType ? `sales_${documentType}s` : 'sales_documents';
  const prefixes = {
    quotation: 'QT',
    invoice: 'INV',
    credit_note: 'CN',
  };

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try Supabase first with resilient select
      const { data, error } = await supabase
        .from('sales_documents')
        .select('*')
        .eq('company_id', await getCompanyId(user.id));

      if (error) {
        throw error;
      } else {
        const supaData = (data || []) as SalesDocument[];
        setDocuments(documentType ? supaData.filter((d: SalesDocument) => d.document_type === documentType) : supaData);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [documentType]);

  const createDocument = async (docData: Omit<SalesDocument, 'id' | 'document_number' | 'created_at' | 'updated_at' | 'user_id'>): Promise<SalesDocument | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const prefix = prefixes[docData.document_type] || 'DOC';
      const document_number = generateDocNumber(prefix, documents.length);
      const company_id = await getCompanyId(user.id);

      // Prepare items for RPC
      const itemsForRpc = (docData.line_items || []).map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.vat_percent
      }));

      // Call atomic RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_sales_document_v2', {
        p_user_id: user.id,
        p_customer_id: docData.customer_id,
        p_document_type: docData.document_type,
        p_document_number: document_number,
        p_issue_date: docData.document_date,
        p_due_date: (docData as Invoice).due_date || null,
        p_items: itemsForRpc,
        p_notes: docData.notes,
        p_status: docData.status,
        p_converted_from: docData.converted_from || null,
        p_company_id: company_id
      });

      if (rpcError) throw rpcError;

      // Construct full document object for state update
      // Note: We might want to fetch the fresh document to be 100% sure, but for now we construct it to save a round trip
      // We need the ID returned by RPC
      const newDocId = (rpcData as { id: string }).id;
      
      const fullDoc: SalesDocument = {
        ...docData,
        id: newDocId,
        document_number: document_number,
        created_at: new Date().toISOString(), // Approximation
        updated_at: new Date().toISOString(),
        user_id: user.id,
        company_id: company_id,
        // Recalculate totals or trust inputs? Trust inputs for now as they matched RPC logic
      };

      if (docData.document_type === 'invoice' && docData.status === 'posted') {
        toast({ title: 'Accounting', description: 'Invoice posted to journal successfully.' });
      }

      await auditLogger.log({
        action: `CREATE_${docData.document_type.toUpperCase()}`,
        entityType: 'sales_document',
        entityId: newDocId,
        details: { document_number: document_number, total_amount: docData.total_amount, customer_id: docData.customer_id }
      });

      setDocuments(prev => [...prev, fullDoc]);
      toast({ title: 'Success', description: `${docData.document_type} created successfully` });
      return fullDoc;
    } catch (err) {
      console.error('Error creating document:', err);
      toast({ title: 'Error', description: 'Failed to create document', variant: 'destructive' });
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<SalesDocument>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const company_id = await getCompanyId(user.id);

      // If we have line items, use the RPC for full update
      if (updates.line_items) {
         const itemsForRpc = updates.line_items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.vat_percent
         }));

         const { error } = await supabase.rpc('update_sales_document_v2', {
            p_document_id: id,
            p_user_id: user.id,
            p_customer_id: updates.customer_id,
            p_issue_date: updates.document_date,
            p_due_date: (updates as Partial<Invoice>).due_date || updates.document_date,
            p_items: itemsForRpc,
            p_notes: updates.notes,
            p_status: updates.status,
            p_company_id: company_id
         });

         if (error) throw error;
      } else {
         // Just header update (e.g. status change)
         const { error } = await supabase.from('sales_documents').update({
            ...updates,
            updated_at: new Date().toISOString()
         }).eq('id', id);

         if (error) throw error;
      }

      setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d));
      
      await auditLogger.log({
        action: 'UPDATE_SALES_DOCUMENT',
        entityType: 'sales_document',
        entityId: id,
        details: { updates }
      });

      toast({ title: 'Success', description: 'Document updated successfully' });
      return true;
    } catch (err) {
      console.error('Error updating document:', err);
      toast({ title: 'Error', description: 'Failed to update document', variant: 'destructive' });
      return false;
    }
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('sales_documents').delete().eq('id', id);
      
      if (error) throw error;

      await auditLogger.log({
        action: 'DELETE_SALES_DOCUMENT',
        entityType: 'sales_document',
        entityId: id,
        details: {}
      });

      setDocuments(prev => prev.filter(d => d.id !== id));
      toast({ title: 'Success', description: 'Document deleted successfully' });
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      toast({ title: 'Error', description: 'Failed to delete document', variant: 'destructive' });
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
}

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const company_id = await getCompanyId(user.id);
      if (!company_id) return;

      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          allocations:receipt_allocations(*)
        `)
        .eq('company_id', company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching receipts from Supabase:', error);
        throw error;
      } else {
        setReceipts((data || []) as Receipt[]);
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReceipt = async (receiptData: Omit<Receipt, 'id' | 'receipt_number' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Receipt | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const company_id = await getCompanyId(user.id);

      // Call atomic RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_receipt_v2', {
        p_user_id: user.id,
        p_customer_id: receiptData.customer_id,
        p_receipt_date: receiptData.receipt_date,
        p_amount: receiptData.amount,
        p_payment_method: receiptData.payment_method,
        p_reference: receiptData.reference || null,
        p_allocations: (receiptData.allocations || []).map(a => ({
          invoice_id: a.invoice_id,
          amount_applied: a.amount_applied
        })),
        p_notes: receiptData.notes || null,
        p_company_id: company_id
      });

      if (rpcError) throw rpcError;

      const newReceiptId = (rpcData as { id: string }).id;
      const newReceiptNumber = (rpcData as { receipt_number: string }).receipt_number;

      const fullReceipt: Receipt = {
        ...receiptData,
        id: newReceiptId,
        receipt_number: newReceiptNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
      };

      setReceipts(prev => [fullReceipt, ...prev]);
      
      await auditLogger.log({
        action: 'CREATE_RECEIPT',
        entityType: 'receipt',
        entityId: newReceiptId,
        details: { receipt_number: newReceiptNumber, amount: receiptData.amount, customer_id: receiptData.customer_id }
      });

      toast({ title: 'Success', description: 'Receipt created and posted successfully' });
      return fullReceipt;
    } catch (err) {
      console.error('Error creating receipt:', err);
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to create receipt', variant: 'destructive' });
      return null;
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  return {
    receipts,
    loading,
    fetchReceipts,
    createReceipt,
  };
}

export function useCustomerAging(customerId: string) {
  const [aging, setAging] = useState<AgingSummary>({
    current: 0,
    days_30: 0,
    days_60: 0,
    days_90_plus: 0,
  });

  useEffect(() => {
    const calculateAging = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data: invoices, error } = await supabase
          .from('sales_documents')
          .select('due_date, total_amount, amount_paid')
          .eq('customer_id', customerId)
          .neq('status', 'paid')
          .neq('status', 'cancelled');

        if (error) throw error;

        const now = new Date();
        const agingSummary: AgingSummary = { current: 0, days_30: 0, days_60: 0, days_90_plus: 0 };

        (invoices || []).forEach(inv => {
          const amountDue = (inv.total_amount || 0) - (inv.amount_paid || 0);
          if (amountDue <= 0) return;

          const dueDate = new Date(inv.due_date);
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysOverdue <= 0) {
            agingSummary.current += amountDue;
          } else if (daysOverdue <= 30) {
            agingSummary.days_30 += amountDue;
          } else if (daysOverdue <= 60) {
            agingSummary.days_60 += amountDue;
          } else {
            agingSummary.days_90_plus += amountDue;
          }
        });

        setAging(agingSummary);
      } catch (err) {
        console.error('Error calculating customer aging:', err);
      }
    };

    if (customerId) {
      calculateAging();
    }
  }, [customerId]);

  return aging;
}