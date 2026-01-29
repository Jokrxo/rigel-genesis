import { useState, useEffect, useCallback } from "react";
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
import { journalApi, JournalEntry } from "@/lib/journal-api";

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");

  useEffect(() => {
    loadLedgerData();
  }, []);

  const loadLedgerData = async () => {
    try {
      setLoading(true);
      const journalEntries = await journalApi.getEntries();
      
      const flattened: LedgerEntry[] = [];
      
      journalEntries.forEach(entry => {
        // Only include posted entries in GL
        if (entry.status !== 'posted') return; 

        entry.lines.forEach(line => {
            flattened.push({
                id: `${entry.id}-${line.id}`,
                date: entry.date,
                reference: entry.reference,
                description: line.description || entry.description,
                account_code: line.accountId,
                account_name: getAccountName(line.accountId), // Helper function
                debit: Number(line.debit),
                credit: Number(line.credit)
            });
        });
      });
      
      // Sort by date desc
      flattened.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setEntries(flattened);
    } catch (error) {
      console.error("Failed to load ledger data", error);
    } finally {
      setLoading(false);
    }
  };


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
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="1000">1000 - Cash</SelectItem>
              <SelectItem value="1100">1100 - Accounts Receivable</SelectItem>
              <SelectItem value="2000">2000 - Accounts Payable</SelectItem>
              <SelectItem value="4000">4000 - Sales Revenue</SelectItem>
              <SelectItem value="6000">6000 - Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                 <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : filteredEntries.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No entries found</TableCell></TableRow>
            ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell className="font-mono">{entry.reference}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.account_code}</Badge> {entry.account_name}
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.debit > 0 ? entry.debit.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.credit > 0 ? entry.credit.toFixed(2) : "-"}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end gap-8 font-bold text-sm">
          <div>Total Debits: {totalDebits.toFixed(2)}</div>
          <div>Total Credits: {totalCredits.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
};
