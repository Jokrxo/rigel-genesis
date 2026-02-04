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
import { useReceipts, useCustomers, useSalesDocuments } from "@/hooks/useSalesData";
import { ReceiptForm } from "@/components/Sales/ReceiptForm";
import { Plus, Receipt as ReceiptIcon, Eye, Wallet, CreditCard, Building } from "lucide-react";
import type { Receipt, Invoice } from "@/types/sales";

const SalesReceipts = () => {
  const { receipts, loading, createReceipt } = useReceipts();
  const { customers } = useCustomers();
  const { documents: invoices } = useSalesDocuments('invoice');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const handleCreateReceipt = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Receipt, 'id' | 'receipt_number' | 'created_at' | 'updated_at' | 'user_id'>) => {
    await createReceipt(data);
    setIsFormOpen(false);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Wallet className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer': return <Building className="h-4 w-4" />;
      default: return <ReceiptIcon className="h-4 w-4" />;
    }
  };

  const totalReceived = receipts.reduce((sum, r) => sum + r.amount, 0);
  const todayReceipts = receipts.filter(r => 
    new Date(r.receipt_date).toDateString() === new Date().toDateString()
  );
  const todayTotal = todayReceipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Receipts</h1>
            <p className="text-muted-foreground">Record customer payments and allocate to invoices</p>
          </div>
          <Button onClick={handleCreateReceipt}>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Receipts</CardTitle>
              <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receipts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Received</CardTitle>
              <Wallet className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Today's Receipts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todayTotal)}</div>
              <p className="text-sm text-muted-foreground">{todayReceipts.length} transactions</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading receipts...</div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-8">
                <ReceiptIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No receipts yet</h3>
                <p className="text-muted-foreground mb-4">Record your first payment to get started</p>
                <Button onClick={handleCreateReceipt}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-mono">{receipt.receipt_number}</TableCell>
                      <TableCell>{new Date(receipt.receipt_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getCustomerName(receipt.customer_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getPaymentMethodIcon(receipt.payment_method)}
                          {receipt.payment_method.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{receipt.reference || '-'}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(receipt.amount)}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <ReceiptForm
              customers={customers}
              invoices={invoices as Invoice[]}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default SalesReceipts;