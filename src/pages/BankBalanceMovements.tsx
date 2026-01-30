
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, TrendingUp, TrendingDown, DollarSign, Printer, Download, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Chatbot } from "@/components/Shared/Chatbot";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";

interface BankMovement {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'fee';
}

const BankBalanceMovements = () => {
  const [movements, setMovements] = useState<BankMovement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock data
    const mockMovements: BankMovement[] = [
      {
        id: "1",
        date: "2024-01-15",
        description: "Customer Payment - INV001",
        reference: "REF001",
        debit: 0,
        credit: 15000,
        balance: 65000,
        type: "deposit"
      },
      {
        id: "2",
        date: "2024-01-14",
        description: "Supplier Payment - ABC Supplies",
        reference: "REF002",
        debit: 8500,
        credit: 0,
        balance: 50000,
        type: "withdrawal"
      },
      {
        id: "3",
        date: "2024-01-13",
        description: "Bank Charges",
        reference: "REF003",
        debit: 150,
        credit: 0,
        balance: 58500,
        type: "fee"
      }
    ];
    setMovements(mockMovements);
  }, []);

  const filteredMovements = movements.filter(movement =>
    movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCredits = movements.reduce((sum, m) => sum + m.credit, 0);
  const totalDebits = movements.reduce((sum, m) => sum + m.debit, 0);
  const currentBalance = movements.length > 0 ? movements[0].balance : 0;

  const handlePrint = () => {
    printTable('movements-table', 'Bank Balance Movements');
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance'];
    const records = filteredMovements.map(m => ({
      date: m.date,
      description: m.description,
      reference: m.reference,
      debit: m.debit,
      credit: m.credit,
      balance: m.balance,
    }));
    exportToCSV(records, 'bank-movements', headers);
  };

  const handleExportJSON = () => {
    const records = filteredMovements.map(m => ({
      date: m.date,
      description: m.description,
      reference: m.reference,
      debit: m.debit,
      credit: m.credit,
      balance: m.balance,
    }));
    exportToJSON(records, 'bank-movements');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Bank Balance Movements</h1>
            <p className="text-muted-foreground">Track all bank account transactions and movements</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{currentBalance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R{totalCredits.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R{totalDebits.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Movement</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalCredits - totalDebits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R{(totalCredits - totalDebits).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Movements ({filteredMovements.length})
            </CardTitle>
            <CardDescription>
              View all bank account transactions and balance movements
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table id="movements-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{movement.description}</TableCell>
                      <TableCell>{movement.reference}</TableCell>
                      <TableCell>
                        <Badge variant={
                          movement.type === 'deposit' ? 'default' :
                          movement.type === 'withdrawal' ? 'destructive' :
                          movement.type === 'transfer' ? 'secondary' : 'outline'
                        }>
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {movement.debit > 0 ? `R${movement.debit.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {movement.credit > 0 ? `R${movement.credit.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R{movement.balance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default BankBalanceMovements;
