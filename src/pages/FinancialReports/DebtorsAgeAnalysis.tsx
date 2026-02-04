import { useMemo } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCustomers, useSalesDocuments } from "@/hooks/useSalesData";
import { formatCurrency } from "@/lib/utils";
import { Download, Printer, Users } from "lucide-react";
import { printTable, exportToCSV } from "@/utils/printExportUtils";
import { Invoice } from "@/types/sales";

export default function DebtorsAgeAnalysis() {
  const { customers, loading: customersLoading } = useCustomers();
  const { documents: invoices, loading: invoicesLoading } = useSalesDocuments('invoice');

  const agingData = useMemo(() => {
    if (!customers.length || !invoices.length) return [];

    const now = new Date();
    
    return customers.map(customer => {
      const customerInvoices = (invoices as Invoice[]).filter(inv => 
        inv.customer_id === customer.id && 
        inv.status !== 'paid' && 
        inv.status !== 'cancelled' &&
        inv.status !== 'draft' // Exclude drafts from debt
      );

      let current = 0;
      let days30 = 0;
      let days60 = 0;
      let days90 = 0;
      let total = 0;

      customerInvoices.forEach(inv => {
        const amount = inv.amount_due || 0; // Use amount_due which accounts for partial payments
        total += amount;

        const dueDate = new Date(inv.due_date);
        const diffTime = Math.abs(now.getTime() - dueDate.getTime());
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // If not yet due (or due today), it's current. 
        // Note: Logic depends on policy. Usually "Current" is not overdue.
        if (now <= dueDate) {
            current += amount;
        } else {
            // Overdue
            if (daysOverdue <= 30) {
                days30 += amount;
            } else if (daysOverdue <= 60) {
                days60 += amount;
            } else {
                days90 += amount;
            }
        }
      });

      return {
        id: customer.id,
        name: customer.customer_name,
        code: customer.customer_code,
        current,
        days30,
        days60,
        days90,
        total
      };
    }).filter(d => d.total > 0 || d.current > 0); // Only show customers with balance
  }, [customers, invoices]);

  const totals = useMemo(() => {
    return agingData.reduce((acc, curr) => ({
      current: acc.current + curr.current,
      days30: acc.days30 + curr.days30,
      days60: acc.days60 + curr.days60,
      days90: acc.days90 + curr.days90,
      total: acc.total + curr.total
    }), { current: 0, days30: 0, days60: 0, days90: 0, total: 0 });
  }, [agingData]);

  const handlePrint = () => {
    printTable('debtors-table', 'Debtors Age Analysis');
  };

  const handleExportCSV = () => {
    const headers = ['Customer Code', 'Customer Name', 'Current', '30 Days', '60 Days', '90+ Days', 'Total Due'];
    exportToCSV(agingData, 'debtors-age-analysis', headers);
  };

  const isLoading = customersLoading || invoicesLoading;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Debtors Age Analysis</h1>
            <p className="text-muted-foreground">
              Aged analysis of outstanding customer balances
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
              <p className="text-xs text-muted-foreground">{agingData.length} customers owing</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current</CardTitle>
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.current)}</div>
              <p className="text-xs text-muted-foreground">Not yet overdue</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">30-60 Days</CardTitle>
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.days30 + totals.days60)}</div>
              <p className="text-xs text-muted-foreground">Moderately overdue</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">90+ Days</CardTitle>
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.days90)}</div>
              <p className="text-xs text-muted-foreground">Critically overdue</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aged Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="text-center py-4">Loading aging data...</div>
            ) : (
                <div className="overflow-x-auto">
                    <Table id="debtors-table">
                    <TableHeader>
                        <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">30 Days</TableHead>
                        <TableHead className="text-right">60 Days</TableHead>
                        <TableHead className="text-right">90+ Days</TableHead>
                        <TableHead className="text-right font-bold">Total Due</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agingData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">No outstanding balances</TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {agingData.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-muted-foreground">{customer.code}</div>
                                    </TableCell>
                                    <TableCell className="text-right">{customer.current > 0 ? formatCurrency(customer.current) : '-'}</TableCell>
                                    <TableCell className="text-right">{customer.days30 > 0 ? formatCurrency(customer.days30) : '-'}</TableCell>
                                    <TableCell className="text-right">{customer.days60 > 0 ? formatCurrency(customer.days60) : '-'}</TableCell>
                                    <TableCell className="text-right text-red-600 font-medium">{customer.days90 > 0 ? formatCurrency(customer.days90) : '-'}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(customer.total)}</TableCell>
                                </TableRow>
                                ))}
                                {/* Totals Row */}
                                <TableRow className="bg-muted/50 font-bold">
                                    <TableCell>TOTALS</TableCell>
                                    <TableCell className="text-right">{formatCurrency(totals.current)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(totals.days30)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(totals.days60)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(totals.days90)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(totals.total)}</TableCell>
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
