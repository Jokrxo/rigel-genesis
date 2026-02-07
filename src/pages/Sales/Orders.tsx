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
import { PermissionGuard } from "@/components/Shared/PermissionGuard";
import { useSalesDocuments, useCustomers } from "@/hooks/useSalesData";
import { SalesDocumentForm } from "@/components/Sales/SalesDocumentForm";
import { Plus, FileText, Eye, ArrowRight } from "lucide-react";
import type { SalesDocument } from "@/types/sales";

const SalesOrders = () => {
  const { documents: orders, loading, createDocument, updateDocument } = useSalesDocuments('sales_order' as any);
  const { createDocument: createInvoice } = useSalesDocuments('invoice');
  const { customers } = useCustomers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SalesDocument | null>(null);
  const [formMode, setFormMode] = useState<'sales_order' | 'invoice'>('sales_order');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const handleCreateOrder = () => {
    setEditingDoc(null);
    setFormMode('sales_order');
    setIsFormOpen(true);
  };

  const handleConvertToInvoice = (order: SalesDocument) => {
    const invoiceData = {
      ...order,
      id: undefined, // Ensure new ID generation
      document_number: undefined, // Ensure new number generation
      document_type: 'invoice' as const,
      status: 'draft' as const,
      document_date: new Date().toISOString(),
      // Default 30 days due date
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      converted_from: order.id,
    };
    
    setEditingDoc(invoiceData as SalesDocument); // Cast to satisfy type
    setFormMode('invoice');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<SalesDocument, 'id' | 'document_number' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (formMode === 'invoice') {
       await createInvoice(data);
    } else {
      if (editingDoc && editingDoc.id && formMode === 'sales_order') {
        await updateDocument(editingDoc.id, data);
      } else {
        await createDocument(data);
      }
    }
    setIsFormOpen(false);
    setEditingDoc(null);
    setFormMode('sales_order');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'posted': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sales Orders</h1>
            <p className="text-muted-foreground">Manage received orders and convert to invoices</p>
          </div>
          <PermissionGuard action="create" resource="orders">
            <Button onClick={handleCreateOrder}>
              <Plus className="h-4 w-4 mr-2" />
              Receive Order
            </Button>
          </PermissionGuard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'draft').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(orders.reduce((sum, o) => sum + o.grand_total, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">Receive your first order to get started</p>
                <PermissionGuard action="create" resource="orders">
                  <Button onClick={handleCreateOrder}>
                    <Plus className="h-4 w-4 mr-2" />
                    Receive Order
                  </Button>
                </PermissionGuard>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.document_number}</TableCell>
                      <TableCell>{new Date(order.document_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getCustomerName(order.customer_id)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.grand_total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === 'draft' && (
                            <PermissionGuard action="create" resource="invoices">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Convert to Invoice"
                                onClick={() => handleConvertToInvoice(order)}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          )}
                        </div>
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
              <DialogTitle>
                {formMode === 'invoice' 
                  ? "Convert to Invoice" 
                  : (editingDoc ? "Edit Order" : "Receive Order")}
              </DialogTitle>
            </DialogHeader>
            <SalesDocumentForm
              documentType={formMode}
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

export default SalesOrders;
