import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

      // Try to fetch from Supabase, fallback to localStorage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('sales_customers' as any) as any).select('*').eq('user_id', user.id);
      
      if (error) {
        // Fallback to localStorage
        const stored = localStorage.getItem(`customers_${user.id}`);
        const localData = stored ? JSON.parse(stored) : [];
        setCustomers(localData as Customer[]);
        calculateStats(localData as Customer[]);
      } else {
        setCustomers((data || []) as Customer[]);
        calculateStats((data || []) as Customer[]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      toast({ title: 'Error', description: 'Failed to load customers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const calculateStats = (customerList: Customer[]) => {
    const invoices = JSON.parse(localStorage.getItem('sales_invoices') || '[]') as Invoice[];
    const now = new Date();
    
    let totalReceivables = 0;
    let overdueAmount = 0;
    
    invoices.forEach(inv => {
      if (inv.status !== 'paid' && inv.status !== 'cancelled') {
        totalReceivables += inv.amount_due || 0;
        if (new Date(inv.due_date) < now) {
          overdueAmount += inv.amount_due || 0;
        }
      }
    });

    setStats({
      total_customers: customerList.length,
      active_customers: customerList.filter(c => c.is_active).length,
      total_receivables: totalReceivables,
      overdue_amount: overdueAmount,
    });
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'customer_code' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Customer | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newCustomer: Customer = {
        ...customerData,
        id: crypto.randomUUID(),
        customer_code: generateCustomerCode(customers.length),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
      };

      // Try Supabase first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('sales_customers' as any).insert(newCustomer);
      
      if (error) {
        // Fallback to localStorage
        const stored = localStorage.getItem(`customers_${user.id}`);
        const localData = stored ? JSON.parse(stored) : [];
        localData.push(newCustomer);
        localStorage.setItem(`customers_${user.id}`, JSON.stringify(localData));
      }

      setCustomers(prev => [...prev, newCustomer]);
      toast({ title: 'Success', description: 'Customer created successfully' });
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('sales_customers' as any).update(updatedData).eq('id', id);
      
      if (error) {
        // Fallback to localStorage
        const stored = localStorage.getItem(`customers_${user.id}`);
        const localData = stored ? JSON.parse(stored) : [];
        const index = localData.findIndex((c: Customer) => c.id === id);
        if (index !== -1) {
          localData[index] = { ...localData[index], ...updatedData };
          localStorage.setItem(`customers_${user.id}`, JSON.stringify(localData));
        }
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('sales_customers' as any).delete().eq('id', id);
      
      if (error) {
        // Fallback to localStorage
        const stored = localStorage.getItem(`customers_${user.id}`);
        const localData = stored ? JSON.parse(stored) : [];
        const filtered = localData.filter((c: Customer) => c.id !== id);
        localStorage.setItem(`customers_${user.id}`, JSON.stringify(filtered));
      }

      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Success', description: 'Customer deleted successfully' });
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

      const stored = localStorage.getItem(`${storageKey}_${user.id}`);
      const localData = stored ? JSON.parse(stored) : [];
      setDocuments(documentType ? localData.filter((d: SalesDocument) => d.document_type === documentType) : localData);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [storageKey, documentType]);

  const createDocument = async (docData: Omit<SalesDocument, 'id' | 'document_number' | 'created_at' | 'updated_at' | 'user_id'>): Promise<SalesDocument | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const prefix = prefixes[docData.document_type] || 'DOC';
      const newDoc: SalesDocument = {
        ...docData,
        id: crypto.randomUUID(),
        document_number: generateDocNumber(prefix, documents.length),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
      };

      const stored = localStorage.getItem(`${storageKey}_${user.id}`);
      const localData = stored ? JSON.parse(stored) : [];
      localData.push(newDoc);
      localStorage.setItem(`${storageKey}_${user.id}`, JSON.stringify(localData));

      setDocuments(prev => [...prev, newDoc]);
      toast({ title: 'Success', description: `${docData.document_type} created successfully` });
      return newDoc;
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

      const stored = localStorage.getItem(`${storageKey}_${user.id}`);
      const localData = stored ? JSON.parse(stored) : [];
      const index = localData.findIndex((d: SalesDocument) => d.id === id);
      if (index !== -1) {
        localData[index] = { ...localData[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(`${storageKey}_${user.id}`, JSON.stringify(localData));
      }

      setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d));
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

      const stored = localStorage.getItem(`${storageKey}_${user.id}`);
      const localData = stored ? JSON.parse(stored) : [];
      const filtered = localData.filter((d: SalesDocument) => d.id !== id);
      localStorage.setItem(`${storageKey}_${user.id}`, JSON.stringify(filtered));

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

      const stored = localStorage.getItem(`sales_receipts_${user.id}`);
      setReceipts(stored ? JSON.parse(stored) : []);
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

      const newReceipt: Receipt = {
        ...receiptData,
        id: crypto.randomUUID(),
        receipt_number: generateDocNumber('REC', receipts.length),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
      };

      const stored = localStorage.getItem(`sales_receipts_${user.id}`);
      const localData = stored ? JSON.parse(stored) : [];
      localData.push(newReceipt);
      localStorage.setItem(`sales_receipts_${user.id}`, JSON.stringify(localData));

      setReceipts(prev => [...prev, newReceipt]);
      toast({ title: 'Success', description: 'Receipt created successfully' });
      return newReceipt;
    } catch (err) {
      console.error('Error creating receipt:', err);
      toast({ title: 'Error', description: 'Failed to create receipt', variant: 'destructive' });
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

      const stored = localStorage.getItem(`sales_invoices_${user.id}`);
      const invoices = stored ? JSON.parse(stored) as Invoice[] : [];
      const customerInvoices = invoices.filter(inv => 
        inv.customer_id === customerId && 
        inv.status !== 'paid' && 
        inv.status !== 'cancelled'
      );

      const now = new Date();
      const agingSummary: AgingSummary = { current: 0, days_30: 0, days_60: 0, days_90_plus: 0 };

      customerInvoices.forEach(inv => {
        const dueDate = new Date(inv.due_date);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const amount = inv.amount_due || 0;

        if (daysOverdue <= 0) {
          agingSummary.current += amount;
        } else if (daysOverdue <= 30) {
          agingSummary.days_30 += amount;
        } else if (daysOverdue <= 60) {
          agingSummary.days_60 += amount;
        } else {
          agingSummary.days_90_plus += amount;
        }
      });

      setAging(agingSummary);
    };

    if (customerId) {
      calculateAging();
    }
  }, [customerId]);

  return aging;
}