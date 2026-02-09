import { useState, useMemo } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFinancialData } from "@/hooks/useFinancialData";
import { formatCurrency } from "@/lib/utils";
import { Download, Printer, Wallet, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import { printTable, exportToCSV } from "@/utils/printExportUtils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CashControlMasterfile() {
  const { accountBalances, entries, loading } = useFinancialData();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

  // Filter for Cash and Cash Equivalent accounts (typically 1300-1399)
  const cashAccounts = useMemo(() => {
    return accountBalances.filter(acc => {
      const code = parseInt(acc.code);
      return (code >= 1300 && code < 1400) || acc.name.toLowerCase().includes('cash') || acc.name.toLowerCase().includes('bank');
    });
  }, [accountBalances]);

  const totalCashBalance = cashAccounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);

  // Get transactions for selected account(s)
  const transactions = useMemo(() => {
    if (!entries) return [];
    
    const relevantEntries = entries.filter(e => e.status === 'posted');
    
    // Flatten to line items level for display
    interface CashTransaction {
      id: string;
      date: string;
      description: string;
      accountName: string;
      reference: string;
      debit: number;
      credit: number;
      type: 'debit' | 'credit';
    }

    const flatLines: CashTransaction[] = [];
    
    relevantEntries.forEach(entry => {
      entry.lines.forEach(line => {
        const isRelevantAccount = selectedAccountId === "all" 
          ? cashAccounts.some(acc => acc.account_id === line.accountId)
          : line.accountId === selectedAccountId;

        if (isRelevantAccount) {
          flatLines.push({
            id: entry.id, // Use entry ID for key, might need unique if multiple lines hit same account (unlikely for cash)
            date: entry.date,
            description: entry.description || line.description,
            accountName: cashAccounts.find(a => a.account_id === line.accountId)?.name || 'Unknown',
            reference: entry.reference,
            debit: Number(line.debit),
            credit: Number(line.credit),
            type: Number(line.debit) > 0 ? 'debit' : 'credit'
          });
        }
      });
    });

    return flatLines.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, cashAccounts, selectedAccountId]);

  const totalDebits = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredits = transactions.reduce((sum, t) => sum + t.credit, 0);
  const netMovement = totalDebits - totalCredits;

  const handlePrint = () => {
    printTable('cash-control-table', 'Cash Control Masterfile');
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Account', 'Description', 'Reference', 'Debit', 'Credit'];
    exportToCSV(transactions, 'cash-control-masterfile', headers);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cash Control Masterfile</h1>
            <p className="text-muted-foreground">
              Master control view of all cash and bank accounts
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
              <CardTitle className="text-sm font-medium">Total Cash Position</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCashBalance)}</div>
              <p className="text-xs text-muted-foreground">Across {cashAccounts.length} accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receipts (Period)</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDebits)}</div>
              <p className="text-xs text-muted-foreground">Total cash inflows</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments (Period)</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCredits)}</div>
              <p className="text-xs text-muted-foreground">Total cash outflows</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Movement</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netMovement)}
              </div>
              <p className="text-xs text-muted-foreground">Net change in period</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Selection */}
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Filter by Account:</span>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Cash Accounts</SelectItem>
                    {cashAccounts.map(acc => (
                        <SelectItem key={acc.account_id} value={acc.account_id}>
                            {acc.code} - {acc.name} ({formatCurrency(acc.current_balance)})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Transactions</CardTitle>
            <CardDescription>
                Detailed movement for {selectedAccountId === 'all' ? 'all cash accounts' : 'selected account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? (
                 <div className="text-center py-4">Loading financial data...</div>
             ) : (
                <div className="overflow-x-auto">
                    <Table id="cash-control-table">
                    <TableHeader>
                        <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Debit (In)</TableHead>
                        <TableHead className="text-right">Credit (Out)</TableHead>
                        <TableHead className="text-right">Type</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">No transactions found</TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((t, index) => (
                            <TableRow key={`${t.id}-${index}`}>
                                <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                <TableCell>{t.accountName}</TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell>{t.reference}</TableCell>
                                <TableCell className="text-right">{t.debit > 0 ? formatCurrency(t.debit) : '-'}</TableCell>
                                <TableCell className="text-right">{t.credit > 0 ? formatCurrency(t.credit) : '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={t.type === 'debit' ? 'default' : 'secondary'}>
                                        {t.type === 'debit' ? 'Receipt' : 'Payment'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                            ))
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
