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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSalesDocuments, useCustomers } from "@/hooks/useSalesData";
import { PermissionGuard } from "@/components/Shared/PermissionGuard";
import { SalesDocumentForm } from "@/components/Sales/SalesDocumentForm";
import { Plus, FileText, Eye, ArrowRight, Pencil, Trash2 } from "lucide-react";
import type { SalesDocument } from "@/types/sales";

const SalesQuotations = () => {
  const { documents: quotations, loading, createDocument, updateDocument, deleteDocument } = useSalesDocuments('quotation');
  const { createDocument: createInvoice } = useSalesDocuments('invoice');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { createDocument: createOrder } = useSalesDocuments('sales_order' as any);
  const { customers } = useCustomers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SalesDocument | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const [formMode, setFormMode] = useState<'quotation' | 'sales_order' | 'invoice'>('quotation');

  const handleCreateQuotation = () => {
    setEditingDoc(null);
    setFormMode('quotation');
    setIsFormOpen(true);
  };

  const handleEditQuotation = (quotation: SalesDocument) => {
    setEditingDoc(quotation);
    setFormMode('quotation');
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      await deleteDocument(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleConvertToOrder = (quotation: SalesDocument) => {
    const orderData = {
      ...quotation,
      id: undefined,
      document_number: undefined,
      document_type: 'sales_order' as const,
      status: 'draft' as const,
      document_date: new Date().toISOString(),
      converted_from: quotation.id,
    };
    
    setEditingDoc(orderData as SalesDocument);
    setFormMode('sales_order');
    setIsFormOpen(true);
  };

  const handleConvertToInvoice = (quotation: SalesDocument) => {
    const invoiceData = {
      ...quotation,
      id: undefined, // Ensure new ID generation
      document_number: undefined, // Ensure new number generation
      document_type: 'invoice' as const,
      status: 'draft' as const,
      document_date: new Date().toISOString(),
      // Default 30 days due date
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      converted_from: quotation.id,
    };
    
    setEditingDoc(invoiceData as SalesDocument); // Cast to satisfy type
    setFormMode('invoice');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<SalesDocument, 'id' | 'document_number' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (formMode === 'invoice') {
       await createInvoice(data);
    } else if (formMode === 'sales_order') {
       await createOrder(data);
    } else {
      if (editingDoc && editingDoc.id) {
        await updateDocument(editingDoc.id, data);
      } else {
        await createDocument(data);
      }
    }
    setIsFormOpen(false);
    setEditingDoc(null);
    setFormMode('quotation');
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
            <h1 className="text-3xl font-bold">Quotations</h1>
            <p className="text-muted-foreground">Create and manage sales quotations</p>
          </div>
          <PermissionGuard action="create" resource="quotes">
            <Button onClick={handleCreateQuotation}>
              <Plus className="h-4 w-4 mr-2" />
              New Quotation
            </Button>
          </PermissionGuard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Quotations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotations.filter(q => q.status === 'draft').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(quotations.reduce((sum, q) => sum + q.grand_total, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading quotations...</div>
            ) : quotations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No quotations yet</h3>
                <p className="text-muted-foreground mb-4">Create your first quotation to get started</p>
                <PermissionGuard action="create" resource="quotes">
                  <Button onClick={handleCreateQuotation}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Quotation
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
                  {quotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-mono">{quotation.document_number}</TableCell>
                      <TableCell>{new Date(quotation.document_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getCustomerName(quotation.customer_id)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(quotation.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(quotation.grand_total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditQuotation(quotation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <PermissionGuard action="edit" resource="quotes">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditQuotation(quotation)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard action="delete" resource="quotes">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirmId(quotation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          {quotation.status === 'draft' && (
                            <PermissionGuard action="create" resource="invoices">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Convert to Invoice"
                                onClick={() => handleConvertToInvoice(quotation)}
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

        <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quotation?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the quotation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {formMode === 'invoice' 
                  ? "Convert to Invoice" 
                  : formMode === 'sales_order'
                  ? "Convert to Order"
                  : (editingDoc ? "Edit Quotation" : "New Quotation")}
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

export default SalesQuotations;