import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Printer, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
}

export const GeneralLedgerTable = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");

  useEffect(() => {
    // Mock data
    const mockData: LedgerEntry[] = [
      {
        id: "1",
        date: "2024-01-01",
        reference: "INV-001",
        description: "Sales Invoice #001",
        account_code: "1100",
        account_name: "Accounts Receivable",
        debit: 5000,
        credit: 0,
      },
      {
        id: "2",
        date: "2024-01-01",
        reference: "INV-001",
        description: "Sales Invoice #001",
        account_code: "4000",
        account_name: "Sales Revenue",
        debit: 0,
        credit: 5000,
      },
      {
        id: "3",
        date: "2024-01-05",
        reference: "PAY-001",
        description: "Office Supplies",
        account_code: "6000",
        account_name: "Operating Expenses",
        debit: 250,
        credit: 0,
      },
      {
        id: "4",
        date: "2024-01-05",
        reference: "PAY-001",
        description: "Payment for Supplies",
        account_code: "1000",
        account_name: "Cash",
        debit: 0,
        credit: 250,
      },
    ];
    setEntries(mockData);
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAccount = accountFilter === "all" || entry.account_code === accountFilter;

    return matchesSearch && matchesAccount;
  });

  const totalDebits = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Ledger Entries</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="1000">1000 - Cash</SelectItem>
                <SelectItem value="1100">1100 - Accounts Receivable</SelectItem>
                <SelectItem value="4000">4000 - Sales Revenue</SelectItem>
                <SelectItem value="6000">6000 - Operating Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No entries found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell><Badge variant="outline">{entry.reference}</Badge></TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs mr-2">{entry.account_code}</span>
                      {entry.account_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.debit > 0 ? entry.debit.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.credit > 0 ? entry.credit.toFixed(2) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-8 font-medium text-sm pt-2">
          <div>Total Debits: {totalDebits.toFixed(2)}</div>
          <div>Total Credits: {totalCredits.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
};
