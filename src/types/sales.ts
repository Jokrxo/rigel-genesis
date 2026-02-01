export interface SalesDocument {
  id: string;
  user_id: string;
  customer_id: string | null;
  document_type: 'invoice' | 'quotation';
  document_number: string;
  issue_date: string;
  due_date: string | null;
  valid_until: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void' | 'accepted' | 'rejected';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  terms_and_conditions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesDocumentItem {
  id: string;
  document_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  tax_rate: number;
  line_total: number;
  sort_order: number;
}
