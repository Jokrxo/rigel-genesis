import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface JournalLine {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  status: 'draft' | 'posted';
  lines: JournalLine[];
}

export const JournalEntryManager = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      date: "2024-01-15",
      reference: "JE-2024-001",
      description: "Monthly Rent Accrual",
      status: "posted",
      lines: [
        { id: "1", accountId: "6000", description: "Rent Expense", debit: 5000, credit: 0 },
        { id: "2", accountId: "2000", description: "Accrued Expenses", debit: 0, credit: 5000 }
      ]
    }
  ]);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Form State
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEntryRef, setNewEntryRef] = useState("");
  const [newEntryDesc, setNewEntryDesc] = useState("");
  const [newEntryLines, setNewEntryLines] = useState<JournalLine[]>([
    { id: "1", accountId: "", description: "", debit: 0, credit: 0 },
    { id: "2", accountId: "", description: "", debit: 0, credit: 0 }
  ]);

  const handleAddLine = () => {
    setNewEntryLines([...newEntryLines, { 
      id: Date.now().toString(), 
      accountId: "", 
      description: "", 
      debit: 0, 
      credit: 0 
    }]);
  };

  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setNewEntryLines(lines => lines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const removeLine = (id: string) => {
    if (newEntryLines.length <= 2) return;
    setNewEntryLines(lines => lines.filter(line => line.id !== id));
  };

  const totalDebits = newEntryLines.reduce((sum, line) => sum + Number(line.debit), 0);
  const totalCredits = newEntryLines.reduce((sum, line) => sum + Number(line.credit), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const handleSave = () => {
    if (!newEntryRef || !newEntryDesc) {
      toast({ title: "Error", description: "Please fill in all header fields", variant: "destructive" });
      return;
    }
    if (!isBalanced) {
      toast({ title: "Error", description: "Journal entry is not balanced", variant: "destructive" });
      return;
    }
    if (totalDebits === 0) {
      toast({ title: "Error", description: "Journal entry cannot be zero", variant: "destructive" });
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: newEntryDate,
      reference: newEntryRef,
      description: newEntryDesc,
      status: "draft",
      lines: newEntryLines
    };

    setEntries([newEntry, ...entries]);
    setIsCreateOpen(false);
    toast({ title: "Success", description: "Journal entry saved as draft" });
    
    // Reset form
    setNewEntryRef("");
    setNewEntryDesc("");
    setNewEntryLines([
      { id: "1", accountId: "", description: "", debit: 0, credit: 0 },
      { id: "2", accountId: "", description: "", debit: 0, credit: 0 }
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search journals..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Journal Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={newEntryDate} onChange={(e) => setNewEntryDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <Input placeholder="e.g. JE-2024-002" value={newEntryRef} onChange={(e) => setNewEntryRef(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Description" value={newEntryDesc} onChange={(e) => setNewEntryDesc(e.target.value)} />
                </div>
              </div>

              <div className="border rounded-md p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Account</TableHead>
                      <TableHead>Description (Line)</TableHead>
                      <TableHead className="w-[120px] text-right">Debit</TableHead>
                      <TableHead className="w-[120px] text-right">Credit</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newEntryLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Select 
                            value={line.accountId} 
                            onValueChange={(val) => updateLine(line.id, 'accountId', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1000">1000 - Cash</SelectItem>
                              <SelectItem value="1100">1100 - Accounts Receivable</SelectItem>
                              <SelectItem value="2000">2000 - Accounts Payable</SelectItem>
                              <SelectItem value="4000">4000 - Sales Revenue</SelectItem>
                              <SelectItem value="6000">6000 - Expenses</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={line.description} 
                            onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                            placeholder="Line description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={line.debit} 
                            onChange={(e) => updateLine(line.id, 'debit', Number(e.target.value))}
                            className="text-right"
                            disabled={line.credit > 0}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={line.credit} 
                            onChange={(e) => updateLine(line.id, 'credit', Number(e.target.value))}
                            className="text-right"
                            disabled={line.debit > 0}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeLine(line.id)} disabled={newEntryLines.length <= 2}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-between items-center">
                  <Button variant="outline" size="sm" onClick={handleAddLine}><Plus className="mr-2 h-4 w-4" /> Add Line</Button>
                  <div className="flex gap-4 text-sm font-medium">
                    <span className={isBalanced ? "text-green-600" : "text-red-600"}>
                      Total Debits: {totalDebits.toFixed(2)}
                    </span>
                    <span className={isBalanced ? "text-green-600" : "text-red-600"}>
                      Total Credits: {totalCredits.toFixed(2)}
                    </span>
                    {!isBalanced && <span className="text-red-600 ml-2">(Difference: {(totalDebits - totalCredits).toFixed(2)})</span>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Journal Entry</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase())).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="font-mono">{entry.reference}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.lines.reduce((sum, l) => sum + l.debit, 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
