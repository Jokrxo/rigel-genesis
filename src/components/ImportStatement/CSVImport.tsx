import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { chartOfAccountsApi, Account } from "@/lib/chart-of-accounts-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Heuristic mapping logic
const suggestAccountMapping = (description: string, amount: number, accounts: Account[]) => {
  const desc = (description || '').toLowerCase();
  
  // 1. Check for specific keywords
  if (desc.includes('bank fee') || desc.includes('service fee') || desc.includes('cash handling')) {
    return accounts.find(a => a.name === 'Bank Charges')?.id;
  }
  if (desc.includes('interest')) {
    return amount > 0 
      ? accounts.find(a => a.name === 'Interest Income')?.id 
      : accounts.find(a => a.name === 'Bank Charges')?.id; // Or Interest Expense if it existed
  }
  if (desc.includes('sars') || desc.includes('vat') || desc.includes('paye')) {
    if (desc.includes('vat')) return accounts.find(a => a.name === 'VAT Payable')?.id;
    if (desc.includes('paye')) return accounts.find(a => a.name === 'PAYE Payable')?.id;
    return accounts.find(a => a.name === 'SARS/Tax Penalties')?.id;
  }
  if (desc.includes('salary') || desc.includes('wages') || desc.includes('payroll')) {
    return accounts.find(a => a.name === 'Salaries and Wages')?.id;
  }
  if (desc.includes('rent')) {
    return accounts.find(a => a.name === 'Rent')?.id;
  }
  if (desc.includes('telkom') || desc.includes('vodacom') || desc.includes('mtn') || desc.includes('internet')) {
    return accounts.find(a => a.name === 'Internet and Telephone')?.id;
  }
  if (desc.includes('insurance')) {
    return accounts.find(a => a.name === 'Insurance')?.id;
  }
  if (desc.includes('marketing') || desc.includes('google') || desc.includes('facebook') || desc.includes('ads') || desc.includes('linkedin')) {
    return accounts.find(a => a.name === 'Marketing')?.id;
  }
  if (desc.includes('travel') || desc.includes('uber') || desc.includes('bolt') || desc.includes('flight') || desc.includes('hotel') || desc.includes('airbnb') || desc.includes('accommodation')) {
    return accounts.find(a => a.name === 'Travel - Local')?.id;
  }
  if (desc.includes('fuel') || desc.includes('petrol') || desc.includes('diesel') || desc.includes('engen') || desc.includes('shell') || desc.includes('sasol') || desc.includes('bp') || desc.includes('total') || desc.includes('caltex')) {
    return accounts.find(a => a.name === 'Motor Vehicle Expenses')?.id;
  }
  if (desc.includes('stationery') || desc.includes('paper') || desc.includes('print') || desc.includes('ink')) {
    return accounts.find(a => a.name === 'Printing and Stationery')?.id;
  }
  if (desc.includes('repair') || desc.includes('maintenance') || desc.includes('fix')) {
    return accounts.find(a => a.name === 'Repairs and Maintenance')?.id;
  }
  if (desc.includes('consulting') || desc.includes('advice') || desc.includes('professional')) {
    return accounts.find(a => a.name === 'Consulting Fees')?.id;
  }
  if (desc.includes('clean') || desc.includes('hygiene')) {
    return accounts.find(a => a.name === 'Cleaning')?.id;
  }
  if (desc.includes('security') || desc.includes('alarm') || desc.includes('adt') || desc.includes('chubb')) {
    return accounts.find(a => a.name === 'Security')?.id;
  }
  if (desc.includes('courier') || desc.includes('post') || desc.includes('dhl') || desc.includes('aramex') || desc.includes('the courier guy')) {
    return accounts.find(a => a.name === 'Courier and Postage')?.id;
  }
  if (desc.includes('electricity') || desc.includes('water') || desc.includes('eskom') || desc.includes('municipality') || desc.includes('city of')) {
    return accounts.find(a => a.name === 'Electricity and Water')?.id;
  }
  if (desc.includes('food') || desc.includes('restaurant') || desc.includes('spar') || desc.includes('checkers') || desc.includes('woolworths') || desc.includes('pick n pay') || desc.includes('coffee')) {
    return accounts.find(a => a.name === 'Staff Welfare')?.id; // Or Entertainment, but default to Welfare for groceries
  }

  // 2. Default based on transaction direction
  if (amount > 0) {
    return accounts.find(a => a.code === '4000')?.id; // Sales Revenue
  } else {
    return accounts.find(a => a.code === '6170')?.id; // General Expenses
  }
};

interface CSVTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  suggestedAccountId: string | undefined;
}

export const CSVImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [previewData, setPreviewData] = useState<CSVTransaction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const accs = await chartOfAccountsApi.getAccounts();
    setAccounts(accs.filter(a => a.isActive));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      // Simple parser assuming Date, Description, Amount columns exist or are in order
      //Ideally we'd map columns, but for heuristics demo:
      const parsed = lines.slice(1).filter(l => l.trim()).map((line, idx) => {
        const cols = line.split(',');
        const date = cols[0];
        const description = cols[1];
        const amount = parseFloat(cols[2]); // limit assumptions
        
        return {
          id: idx,
          date,
          description,
          amount,
          suggestedAccountId: suggestAccountMapping(description, amount, accounts)
        };
      });
      setPreviewData(parsed);
      toast({ title: "CSV Parsed", description: `Found ${parsed.length} transactions.` });
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Bank CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-center">
          <Input type="file" accept=".csv" onChange={handleFileChange} />
          <Button onClick={parseCSV} disabled={!file}>Preview & Map</Button>
        </div>

        {previewData.length > 0 && (
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mapped Account</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>
                      <Select defaultValue={row.suggestedAccountId}>
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
