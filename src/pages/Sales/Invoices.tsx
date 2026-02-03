import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSalesDocuments, useCustomers } from "@/hooks/useSalesData";
import { SalesDocumentForm } from "@/components/Sales/SalesDocumentForm";
import { Plus, FileText, Eye, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import type { SalesDocument, Invoice } from "@/types/sales";

const SalesInvoices = () => {
  const { documents, loading, createDocument, updateDocument } = useSalesDocuments('invoice');
  const invoices = documents as Invoice[];
  const { customers } = useCustomers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SalesDocument | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const handleCreateInvoice = () => {
    setEditingDoc(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<SalesDocument, 'id' | 'document_number' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const invoiceData = {
      ...data,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      amount_paid: 0,
      amount_due: data.grand_total,
    };
    
    if (editingDoc) {
      await updateDocument(editingDoc.id, invoiceData);
    } else {
      await createDocument(invoiceData);
    }
    setIsFormOpen(false);
    setEditingDoc(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'posted': return 'default';
      case 'paid': return 'outline';
      case 'partial': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const totalOutstanding = invoices.reduce((sum, inv) => {
    if (inv.status !== 'paid' && inv.status !== 'cancelled') {
      return sum + (inv.amount_due || inv.grand_total);
    }
    return sum;
  }, 0);

  const overdueCount = invoices.filter(inv => {
    if (inv.status === 'paid' || inv.status === 'cancelled') return false;
    return new Date(inv.due_date || inv.document_date) < new Date();
  }).length;

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage sales invoices and track payments</p>
          </div>
          <Button onClick={handleCreateInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {invoices.filter(i => i.status === 'paid').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
                <Button onClick={handleCreateInvoice}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">{invoice.document_number}</TableCell>
                      <TableCell>{new Date(invoice.document_date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{getCustomerName(invoice.customer_id)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(invoice.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.grand_total)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.amount_due || invoice.grand_total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDoc ? "Edit Invoice" : "New Invoice"}</DialogTitle>
            </DialogHeader>
            <SalesDocumentForm
              documentType="invoice"
              initialData={editingDoc || undefined}
              customers={customers}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default SalesInvoices;
