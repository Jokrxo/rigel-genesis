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
import { Plus, FileText, Eye, ArrowRight } from "lucide-react";
import type { SalesDocument } from "@/types/sales";

const SalesQuotations = () => {
  const { documents: quotations, loading, createDocument, updateDocument } = useSalesDocuments('quotation');
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

  const handleCreateQuotation = () => {
    setEditingDoc(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<SalesDocument, 'id' | 'document_number' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (editingDoc) {
      await updateDocument(editingDoc.id, data);
    } else {
      await createDocument(data);
    }
    setIsFormOpen(false);
    setEditingDoc(null);
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
          <Button onClick={handleCreateQuotation}>
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
          </Button>
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
                <Button onClick={handleCreateQuotation}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Quotation
                </Button>
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
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {quotation.status === 'draft' && (
                            <Button variant="ghost" size="sm" title="Convert to Invoice">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
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
              <DialogTitle>{editingDoc ? "Edit Quotation" : "New Quotation"}</DialogTitle>
            </DialogHeader>
            <SalesDocumentForm
              documentType="quotation"
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