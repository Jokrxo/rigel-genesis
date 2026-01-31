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
import { Plus, FileText, Eye, MinusCircle } from "lucide-react";
import type { SalesDocument, CreditNote } from "@/types/sales";

const SalesCreditNotes = () => {
  const { documents, loading, createDocument, updateDocument } = useSalesDocuments('credit_note');
  const creditNotes = documents as CreditNote[];
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

  const handleCreateCreditNote = () => {
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

  const totalCreditNoteValue = creditNotes.reduce((sum, cn) => sum + cn.grand_total, 0);

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Credit Notes</h1>
            <p className="text-muted-foreground">Issue credit notes for returns and adjustments</p>
          </div>
          <Button onClick={handleCreateCreditNote}>
            <Plus className="h-4 w-4 mr-2" />
            New Credit Note
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Credit Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creditNotes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Draft</CardTitle>
              <MinusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creditNotes.filter(cn => cn.status === 'draft').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Value</CardTitle>
              <MinusCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">-{formatCurrency(totalCreditNoteValue)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading credit notes...</div>
            ) : creditNotes.length === 0 ? (
              <div className="text-center py-8">
                <MinusCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No credit notes yet</h3>
                <p className="text-muted-foreground mb-4">Create a credit note when you need to adjust an invoice</p>
                <Button onClick={handleCreateCreditNote}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Credit Note
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditNotes.map((creditNote) => (
                    <TableRow key={creditNote.id}>
                      <TableCell className="font-mono">{creditNote.document_number}</TableCell>
                      <TableCell>{new Date(creditNote.document_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getCustomerName(creditNote.customer_id)}</TableCell>
                      <TableCell>{creditNote.reason || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(creditNote.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {creditNote.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        -{formatCurrency(creditNote.grand_total)}
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
              <DialogTitle>{editingDoc ? "Edit Credit Note" : "New Credit Note"}</DialogTitle>
            </DialogHeader>
            <SalesDocumentForm
              documentType="credit_note"
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

export default SalesCreditNotes;