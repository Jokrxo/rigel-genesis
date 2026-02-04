import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Eye, Pencil } from "lucide-react";
import type { Customer, SalesDocument, LineItem, DocumentType, TransactionType, SaleType, VAT_RATE } from "@/types/sales";

const lineItemSchema = z.object({
  id: z.string(),
  item_name: z.string().min(1, "Item name required"),
  description: z.string(),
  quantity: z.coerce.number().min(1),
  unit_price: z.coerce.number().min(0),
  discount_percent: z.coerce.number().min(0).max(100),
  vat_percent: z.coerce.number().min(0).max(100),
});

const documentSchema = z.object({
  document_date: z.string().min(1, "Date is required"),
  customer_id: z.string().min(1, "Customer is required"),
  transaction_type: z.enum(['service', 'inventory', 'asset']),
  sale_type: z.enum(['cash', 'credit']),
  notes: z.string().optional(),
});

interface SalesDocumentFormProps {
  documentType: DocumentType;
  initialData?: SalesDocument;
  customers: Customer[];
  onSubmit: (data: Omit<SalesDocument, 'id' | 'document_number' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  onCancel: () => void;
  onEditCustomer?: (customer: Customer) => void;
  onViewCustomer?: (customerId: string) => void;
  onDeleteCustomer?: (customer: Customer) => void;
}

const DEFAULT_VAT_RATE = 15;

export const SalesDocumentForm = ({ 
  documentType, 
  initialData, 
  customers, 
  onSubmit, 
  onCancel,
  onEditCustomer,
  onViewCustomer,
  onDeleteCustomer
}: SalesDocumentFormProps) => {
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.line_items || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      document_date: initialData?.document_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      customer_id: initialData?.customer_id || "",
      transaction_type: initialData?.transaction_type || "service" as TransactionType,
      sale_type: initialData?.sale_type || "credit" as SaleType,
      notes: initialData?.notes || "",
    },
  });

  const addLineItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      item_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      vat_percent: DEFAULT_VAT_RATE,
      line_total: 0,
      vat_amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // Recalculate totals
      const baseAmount = updated.quantity * updated.unit_price;
      const discountAmount = baseAmount * (updated.discount_percent / 100);
      const subtotal = baseAmount - discountAmount;
      const vatAmount = subtotal * (updated.vat_percent / 100);
      
      updated.line_total = subtotal + vatAmount;
      updated.vat_amount = vatAmount;
      
      return updated;
    }));
  };

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      const baseAmount = item.quantity * item.unit_price;
      const discountAmount = baseAmount * (item.discount_percent / 100);
      return sum + (baseAmount - discountAmount);
    }, 0);
    
    const vatTotal = lineItems.reduce((sum, item) => sum + item.vat_amount, 0);
    const grandTotal = subtotal + vatTotal;
    
    return { subtotal, vatTotal, grandTotal };
  }, [lineItems]);

  const handleSubmit = async (formData: z.infer<typeof documentSchema>) => {
    if (lineItems.length === 0) {
      return; // Could add validation error
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        document_date: formData.document_date,
        customer_id: formData.customer_id,
        transaction_type: formData.transaction_type as TransactionType,
        sale_type: formData.sale_type as SaleType,
        notes: formData.notes,
        document_type: documentType,
        line_items: lineItems,
        subtotal: totals.subtotal,
        vat_total: totals.vatTotal,
        grand_total: totals.grandTotal,
        status: 'draft',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const getDocumentTypeLabel = () => {
    switch (documentType) {
      case 'quotation': return 'Quotation';
      case 'sales_order': return 'Sales Order';
      case 'invoice': return 'Invoice';
      case 'credit_note': return 'Credit Note';
      default: return 'Document';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="document_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Customer *</FormLabel>
                  {field.value && (
                    <div className="flex gap-1">
                      {onViewCustomer && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onViewCustomer(field.value)}
                          title="View Customer"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      {onEditCustomer && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            const customer = customers.find(c => c.id === field.value);
                            if (customer) onEditCustomer(customer);
                          }}
                          title="Edit Customer"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                      {onDeleteCustomer && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => {
                            const customer = customers.find(c => c.id === field.value);
                            if (customer) onDeleteCustomer(customer);
                          }}
                          title="Delete Customer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <SelectItem value="" disabled>
                        No customers available
                      </SelectItem>
                    ) : (
                      customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transaction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sale_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Line Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {lineItems.length === 0 ? (
            <div className="text-center py-8 border rounded-lg text-muted-foreground">
              No items added. Click "Add Item" to begin.
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[80px]">Qty</TableHead>
                    <TableHead className="w-[120px]">Unit Price</TableHead>
                    <TableHead className="w-[80px]">Disc %</TableHead>
                    <TableHead className="w-[80px]">VAT %</TableHead>
                    <TableHead className="w-[120px] text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.item_name}
                          onChange={(e) => updateLineItem(item.id, 'item_name', e.target.value)}
                          placeholder="Item name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount_percent}
                          onChange={(e) => updateLineItem(item.id, 'discount_percent', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.vat_percent}
                          onChange={(e) => updateLineItem(item.id, 'vat_percent', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.line_total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT:</span>
                <span>{formatCurrency(totals.vatTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Grand Total:</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || lineItems.length === 0}>
            {isSubmitting ? "Saving..." : `Save ${getDocumentTypeLabel()}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};