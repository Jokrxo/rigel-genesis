// Sales Module Types

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  tax_number?: string;
  contact_person?: string;
  email: string;
  phone: string;
  mobile?: string;
  billing_address: Address;
  shipping_address?: Address;
  shipping_same_as_billing: boolean;
  credit_limit: number;
  payment_terms: PaymentTerms;
  assigned_salesperson?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export type PaymentTerms = 'cod' | '7_days' | '14_days' | '30_days' | '60_days' | '90_days';

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  cod: 'Cash on Delivery',
  '7_days': '7 Days',
  '14_days': '14 Days',
  '30_days': '30 Days',
  '60_days': '60 Days',
  '90_days': '90 Days',
};

export type DocumentType = 'quotation' | 'invoice' | 'credit_note' | 'receipt';
export type DocumentStatus = 'draft' | 'posted' | 'cancelled' | 'paid' | 'partial';
export type TransactionType = 'service' | 'inventory' | 'asset';
export type SaleType = 'cash' | 'credit';

export interface LineItem {
  id: string;
  item_id?: string;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  vat_percent: number;
  line_total: number;
  vat_amount: number;
}

export interface SalesDocument {
  id: string;
  document_number: string;
  document_type: DocumentType;
  document_date: string;
  customer_id: string;
  customer?: Customer;
  transaction_type: TransactionType;
  sale_type: SaleType;
  line_items: LineItem[];
  subtotal: number;
  vat_total: number;
  grand_total: number;
  notes?: string;
  status: DocumentStatus;
  converted_from?: string; // For quotations converted to invoices
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Quotation extends SalesDocument {
  document_type: 'quotation';
  valid_until?: string;
}

export interface Invoice extends SalesDocument {
  document_type: 'invoice';
  due_date: string;
  amount_paid: number;
  amount_due: number;
}

export interface CreditNote extends SalesDocument {
  document_type: 'credit_note';
  invoice_id?: string;
  reason?: string;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  receipt_date: string;
  customer_id: string;
  customer?: Customer;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'cheque';
  reference?: string;
  allocations: ReceiptAllocation[];
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ReceiptAllocation {
  invoice_id: string;
  invoice_number: string;
  amount_applied: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  document_type: string;
  document_id: string;
  created_at: string;
  user_id: string;
}

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  total_receivables: number;
  overdue_amount: number;
}

export interface AgingSummary {
  current: number;
  days_30: number;
  days_60: number;
  days_90_plus: number;
}

// Default South African address
export const DEFAULT_ADDRESS: Address = {
  street: '',
  city: '',
  province: '',
  postal_code: '',
  country: 'South Africa',
};

// VAT rate for South Africa
export const VAT_RATE = 0.15;

// Account codes for journal entries
export const ACCOUNT_CODES = {
  DEBTORS_CONTROL: '1100',
  SALES_REVENUE: '4000',
  OUTPUT_VAT: '2200',
  COGS: '5000',
  INVENTORY: '1200',
  BANK: '1000',
  CASH: '1001',
} as const;