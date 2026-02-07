import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Customer, Receipt, Invoice } from "@/types/sales";

const receiptSchema = z.object({
  receipt_date: z.string().min(1, "Date is required"),
  customer_id: z.string().min(1, "Customer is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  payment_method: z.enum(['cash', 'bank_transfer', 'card', 'cheque', 'other']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

interface ReceiptFormProps {
  customers: Customer[];
  invoices?: Invoice[];
  onSubmit: (data: Omit<Receipt, 'id' | 'receipt_number' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  onCancel: () => void;
}

export const ReceiptForm = ({ customers, invoices = [], onSubmit, onCancel }: ReceiptFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  const form = useForm({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      receipt_date: new Date().toISOString().split('T')[0],
      customer_id: "",
      amount: 0,
      payment_method: "bank_transfer" as const,
      reference: "",
      notes: "",
    },
  });

  const selectedCustomerId = form.watch("customer_id");
  const currentAmount = form.watch("amount");

  const outstandingInvoices = useMemo(() => {
    if (!selectedCustomerId) return [];
    return invoices.filter(inv => 
      inv.customer_id === selectedCustomerId && 
      inv.status !== 'paid' && 
      inv.status !== 'cancelled'
    ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [invoices, selectedCustomerId]);

  const handleAutoAllocate = () => {
    let remaining = currentAmount;
    const newAllocations: Record<string, number> = {};
    
    outstandingInvoices.forEach(inv => {
      if (remaining <= 0) return;
      
      const due = (inv.amount_due || inv.grand_total); // Fallback if amount_due not set
      const allocate = Math.min(remaining, due);
      
      if (allocate > 0) {
        newAllocations[inv.id] = allocate;
        remaining -= allocate;
      }
    });
    
    setAllocations(newAllocations);
  };

  const handleAllocationChange = (invoiceId: string, amount: number) => {
    const newAllocations = { ...allocations };
    if (amount > 0) {
      newAllocations[invoiceId] = amount;
    } else {
      delete newAllocations[invoiceId];
    }
    setAllocations(newAllocations);
  };

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  // Clear allocations when customer changes
  useEffect(() => {
    setAllocations({});
  }, [selectedCustomerId]);

  const handleSubmit = async (formData: z.infer<typeof receiptSchema>) => {
    if (totalAllocated > formData.amount) {
      form.setError("amount", { 
        type: "manual", 
        message: "Allocated amount cannot exceed receipt amount" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert allocations map to array matching ReceiptAllocation interface
      const allocationArray = Object.entries(allocations).map(([invoice_id, amount]) => {
        const invoice = outstandingInvoices.find(inv => inv.id === invoice_id);
        return {
          invoice_id,
          invoice_number: invoice?.document_number || '',
          amount_applied: amount
        };
      });

      await onSubmit({
        receipt_date: formData.receipt_date,
        customer_id: formData.customer_id,
        amount: formData.amount,
        payment_method: formData.payment_method,
        reference: formData.reference,
        notes: formData.notes,
        allocations: allocationArray,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="receipt_date"
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
                <FormLabel>Customer *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (ZAR) *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Reference</FormLabel>
                <FormControl>
                  <Input placeholder="Payment reference or transaction ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

          {/* Allocation Section */}
          {outstandingInvoices.length > 0 && (
            <div className="space-y-4 border rounded-md p-4 bg-muted/20">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm">Outstanding Invoices</h3>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-muted-foreground">
                      Allocated: {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(totalAllocated)}
                   </span>
                   <Button type="button" variant="secondary" size="sm" onClick={handleAutoAllocate}>
                     Auto Allocate
                   </Button>
                </div>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead className="text-right w-[150px]">Allocate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>{new Date(inv.document_date).toLocaleDateString()}</TableCell>
                        <TableCell>{inv.document_number}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(inv.amount_due || inv.grand_total)}
                        </TableCell>
                        <TableCell>
                           <Input 
                             type="number" 
                             min="0" 
                             step="0.01"
                             className="text-right h-8"
                             value={allocations[inv.id] || ''}
                             onChange={(e) => handleAllocationChange(inv.id, parseFloat(e.target.value) || 0)}
                           />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalAllocated > currentAmount && (
                 <p className="text-sm text-destructive font-medium">
                   Warning: Allocated amount exceeds receipt amount.
                 </p>
              )}
            </div>
          )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};