
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { auditLogger } from "@/lib/audit-logger";

interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  address_line1?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

interface Product {
  id: string;
  name: string;
  unit_price: number;
  tax_rate?: number;
}

interface LineItem {
  id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  tax_rate: number;
  line_total: number;
}

export interface FormDocument {
  id: string;
  customer_id: string;
  issue_date: string;
  due_date?: string;
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
  document_number: string;
  [key: string]: unknown;
}

interface DocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: "invoice" | "quotation";
  onSuccess: () => void;
  editingDocument?: FormDocument | null;
}

export const DocumentForm = ({ open, onOpenChange, documentType, onSuccess, editingDocument }: DocumentFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [formData, setFormData] = useState({
    customer_id: "",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: "",
    valid_until: "",
    terms_and_conditions: "Payment due within 30 days. Late payments may incur additional charges.",
    notes: "",
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchProducts();
      
      if (editingDocument) {
        // Load editing document data
        setFormData({
          customer_id: editingDocument.customer_id || "",
          issue_date: editingDocument.issue_date || new Date().toISOString().split('T')[0],
          due_date: editingDocument.due_date || "",
          valid_until: editingDocument.valid_until || "",
          terms_and_conditions: editingDocument.terms_and_conditions || "Payment due within 30 days. Late payments may incur additional charges.",
          notes: editingDocument.notes || "",
        });
        // You would also load line items here if editing
      } else {
        // Reset for new document
        setLineItems([{
          description: "",
          quantity: 1,
          unit_price: 0,
          discount_percentage: 0,
          tax_rate: 15,
          line_total: 0,
        }]);
      }
    }
  }, [open, editingDocument]);

  const fetchCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) return;

      const { data, error } = await supabase
        .from('customers')
        .select('id, name, company, email, address_line1, city, province, postal_code')
        .eq('company_id', profile.company_id)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) return;

      const { data, error } = await supabase
        .from('products')
        .select('id, name, unit_price, tax_rate')
        .eq('is_active', true)
        .eq('company_id', profile.company_id)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculateLineTotal = (item: LineItem) => {
    const subtotal = item.quantity * item.unit_price;
    const discountAmount = subtotal * (item.discount_percentage / 100);
    const discountedAmount = subtotal - discountAmount;
    const taxAmount = discountedAmount * (item.tax_rate / 100);
    return discountedAmount + taxAmount;
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: unknown) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    
    // Recalculate line total
    newLineItems[index].line_total = calculateLineTotal(newLineItems[index]);
    
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      description: "",
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      tax_rate: 15,
      line_total: 0,
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateLineItem(index, 'product_id', productId);
      updateLineItem(index, 'description', product.name);
      updateLineItem(index, 'unit_price', product.unit_price);
      updateLineItem(index, 'tax_rate', product.tax_rate || 15);
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => {
      const lineSubtotal = item.quantity * item.unit_price;
      const discountAmount = lineSubtotal * (item.discount_percentage / 100);
      return sum + (lineSubtotal - discountAmount);
    }, 0);

    const taxAmount = lineItems.reduce((sum, item) => {
      const lineSubtotal = item.quantity * item.unit_price;
      const discountAmount = lineSubtotal * (item.discount_percentage / 100);
      const discountedAmount = lineSubtotal - discountAmount;
      return sum + (discountedAmount * (item.tax_rate / 100));
    }, 0);

    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  };

  const generateDocumentNumber = () => {
    const prefix = documentType === "invoice" ? "INV" : "QT";
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${year}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lineItems.length === 0 || !formData.customer_id) {
      toast({
        title: "Error",
        description: "Please select a customer and add at least one line item",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) throw new Error('Company not found');

      const totals = calculateTotals();
      const documentNumber = editingDocument?.document_number || generateDocumentNumber();

      const documentData = {
        company_id: profile.company_id,
        document_type: documentType,
        document_number: documentNumber,
        customer_id: formData.customer_id,
        issue_date: formData.issue_date,
        due_date: formData.due_date || null,
        valid_until: formData.valid_until || null,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        total_amount: totals.total,
        terms_and_conditions: formData.terms_and_conditions,
        notes: formData.notes,
        user_id: user.id,
      };

      let documentId;

      if (editingDocument) {
        const { error } = await supabase
          .from('sales_documents')
          .update(documentData)
          .eq('id', editingDocument.id)
          .eq('company_id', profile.company_id);

        if (error) throw error;
        documentId = editingDocument.id;

        await auditLogger.log({
          action: `UPDATE_${documentType.toUpperCase()}`,
          entityType: 'sales_document',
          entityId: documentId,
          details: { updates: documentData }
        });

        // Delete existing line items
        await supabase
          .from('sales_document_items')
          .delete()
          .eq('document_id', documentId);
      } else {
        const { data, error } = await supabase
          .from('sales_documents')
          .insert([documentData])
          .select()
          .single();

        if (error) throw error;
        documentId = data.id;

        await auditLogger.log({
          action: `CREATE_${documentType.toUpperCase()}`,
          entityType: 'sales_document',
          entityId: documentId,
          details: { document_number: documentNumber, total_amount: totals.total }
        });
      }

      // Insert line items
      const lineItemsData = lineItems.map((item, index) => ({
        document_id: documentId,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        tax_rate: item.tax_rate,
        line_total: item.line_total,
        sort_order: index,
      }));

      const { error: lineItemsError } = await supabase
        .from('sales_document_items')
        .insert(lineItemsData);

      if (lineItemsError) throw lineItemsError;

      toast({
        title: "Success",
        description: `${documentType} ${editingDocument ? 'updated' : 'created'} successfully`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingDocument ? 'update' : 'create'} ${documentType}`,
        variant: "destructive",
      });
    }
  };

  const totals = calculateTotals();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingDocument ? "Edit" : "Create"} {documentType === "invoice" ? "Invoice" : "Quotation"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer_id">Customer *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} {customer.company ? `(${customer.company})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  />
                </div>

                {documentType === "invoice" && (
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                )}

                {documentType === "quotation" && (
                  <div>
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Line Items
                <Button type="button" onClick={addLineItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product/Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Discount %</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="min-w-[200px]">
                          <div className="space-y-2">
                            <Select
                              value={item.product_id || ""}
                              onValueChange={(value) => selectProduct(index, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} - {formatCurrency(product.unit_price)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={item.discount_percentage}
                            onChange={(e) => updateLineItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.tax_rate}
                            onChange={(e) => updateLineItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.line_total)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
              <Textarea
                id="terms_and_conditions"
                value={formData.terms_and_conditions}
                onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingDocument ? "Update" : "Create"} {documentType === "invoice" ? "Invoice" : "Quotation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
