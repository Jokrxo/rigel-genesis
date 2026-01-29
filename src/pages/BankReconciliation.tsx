import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Upload, FileText, ArrowRightLeft, RefreshCw, AlertTriangle, Link, Calendar as CalendarIcon, Download, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { journalApi } from "@/lib/journal-api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { bankingService, BankTransaction } from "@/services/banking-service";

// Mock data types (removed BankTransaction as it is imported)
interface SystemTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'unmatched' | 'matched';
  matchedId?: string;
}

export default function BankReconciliation() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("match");
  
  // Selection for manual match
  const [selectedBankTxId, setSelectedBankTxId] = useState<string | null>(null);
  const [selectedSystemTxId, setSelectedSystemTxId] = useState<string | null>(null);

  // Date Range
  const [startDate, setStartDate] = useState("2024-03-01");
  const [endDate, setEndDate] = useState("2024-03-31");

  // Adjustment Dialog
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentTx, setAdjustmentTx] = useState<BankTransaction | null>(null);
  const [adjustmentAccount, setAdjustmentAccount] = useState("");
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  // Connect Bank Dialog
  const [isConnectBankOpen, setIsConnectBankOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock data state
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
      const txs = await bankingService.getTransactions('default');
      if (txs.length > 0) {
          setBankTransactions(txs);
      } else {
          // Fallback to initial demo data if empty
          setBankTransactions([
            { id: 'bt1', date: '2024-03-01', description: 'SERVICE FEES', amount: 50.00, type: 'debit', status: 'unmatched' },
            { id: 'bt2', date: '2024-03-02', description: 'CLIENT PAYMENT REF 1001', amount: 1500.00, type: 'credit', status: 'unmatched' },
            { id: 'bt3', date: '2024-03-05', description: 'OFFICE SUPPLIES', amount: 230.50, type: 'debit', status: 'unmatched' },
            { id: 'bt4', date: '2024-03-10', description: 'UNKNOWN TRANSFER', amount: 5000.00, type: 'credit', status: 'flagged' },
            { id: 'bt5', date: '2024-03-12', description: 'INTEREST', amount: 12.45, type: 'credit', status: 'unmatched' },
          ]);
      }
  };

  const handleConnectBank = async (bankName: string = "Demo Bank") => {
      setIsConnecting(true);
      try {
          await bankingService.connectBank(typeof bankName === 'string' ? bankName : "Demo Bank");
          await loadTransactions();
          setIsConnectBankOpen(false);
          toast({ title: "Bank Connected", description: `Successfully connected to ${typeof bankName === 'string' ? bankName : "Demo Bank"} feed.` });
      } catch (e) {
          toast({ title: "Connection Failed", description: "Could not connect to bank.", variant: "destructive" });
      } finally {
          setIsConnecting(false);
      }
  };

  const handleExportCSV = () => {
      const headers = ["ID", "Date", "Description", "Amount", "Type", "Status"];
      const rows = bankTransactions.map(tx => [tx.id, tx.date, tx.description, tx.amount, tx.type, tx.status].join(","));
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "bank_reconciliation.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const [systemTransactions, setSystemTransactions] = useState<SystemTransaction[]>([
    { id: 'st1', date: '2024-03-02', description: 'Inv #1001 Payment', amount: 1500.00, type: 'debit', status: 'unmatched' }, 
    { id: 'st2', date: '2024-03-05', description: 'Office Supplies Expense', amount: 230.50, type: 'credit', status: 'unmatched' }, 
    { id: 'st3', date: '2024-03-01', description: 'Bank Fees', amount: 45.00, type: 'credit', status: 'unmatched' }, // Mismatch amount demo
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate parsing
      setTimeout(() => {
          const newTxs: BankTransaction[] = [
              { id: `bt_new_${Date.now()}_1`, date: '2024-03-15', description: 'NEW UPLOAD ITEM 1', amount: 120.00, type: 'debit', status: 'unmatched' },
              { id: `bt_new_${Date.now()}_2`, date: '2024-03-16', description: 'NEW UPLOAD ITEM 2', amount: 500.00, type: 'credit', status: 'unmatched' }
          ];
          setBankTransactions([...bankTransactions, ...newTxs]);
          toast({
            title: "Statement Uploaded",
            description: `Successfully parsed ${e.target.files![0].name}. Added ${newTxs.length} transactions.`,
          });
      }, 1000);
    }
  };

  const autoMatch = () => {
    let matchedCount = 0;
    const newBankTx = [...bankTransactions];
    const newSystemTx = [...systemTransactions];

    newBankTx.forEach(bt => {
      if (bt.status !== 'unmatched') return;

      // Find matching system transaction (Amount matches, Date close?)
      const targetType = bt.type === 'credit' ? 'debit' : 'credit';
      
      const matchIndex = newSystemTx.findIndex(st => 
        st.status === 'unmatched' && 
        Math.abs(st.amount - bt.amount) < 0.01 && 
        st.type === targetType
      );

      if (matchIndex >= 0) {
        // Match found
        bt.status = 'matched';
        bt.matchedId = newSystemTx[matchIndex].id;
        newSystemTx[matchIndex].status = 'matched';
        newSystemTx[matchIndex].matchedId = bt.id;
        matchedCount++;
      }
    });

    setBankTransactions(newBankTx);
    setSystemTransactions(newSystemTx);

    toast({
      title: "Auto-Match Complete",
      description: `Matched ${matchedCount} transactions successfully.`,
    });
  };

  const handleManualMatch = () => {
      if (!selectedBankTxId || !selectedSystemTxId) {
          toast({ title: "Selection Incomplete", description: "Please select one transaction from each side to match.", variant: "destructive" });
          return;
      }
      
      const bankTx = bankTransactions.find(t => t.id === selectedBankTxId);
      const sysTx = systemTransactions.find(t => t.id === selectedSystemTxId);

      if (!bankTx || !sysTx) return;

      // Validate opposite types (Credit vs Debit) generally
      // But user might want to match anyway
      
      if (Math.abs(bankTx.amount - sysTx.amount) > 0.01) {
          if (!confirm(`Amounts differ (Bank: ${bankTx.amount.toFixed(2)}, System: ${sysTx.amount.toFixed(2)}). Match anyway?`)) {
              return;
          }
      }

      const newBankTx = bankTransactions.map(t => t.id === selectedBankTxId ? { ...t, status: 'matched' as const, matchedId: selectedSystemTxId } : t);
      const newSystemTx = systemTransactions.map(t => t.id === selectedSystemTxId ? { ...t, status: 'matched' as const, matchedId: selectedBankTxId } : t);

      setBankTransactions(newBankTx);
      setSystemTransactions(newSystemTx);
      setSelectedBankTxId(null);
      setSelectedSystemTxId(null);
      
      toast({ title: "Matched", description: "Transactions manually matched." });
  };

  const flagTransaction = (id: string) => {
    setBankTransactions(bankTransactions.map(t => t.id === id ? { ...t, status: 'flagged' } : t));
  };
  
  const openAdjustmentDialog = (tx: BankTransaction) => {
      setAdjustmentTx(tx);
      setIsAdjustmentOpen(true);
  };

  const handleCreateAdjustment = async () => {
      if (!adjustmentTx || !adjustmentAccount) return;
      
      try {
          setAdjustmentLoading(true);
          // Create Journal Entry
          // Logic: 
          // If Bank Debit (Money Out) -> Credit Bank, Debit Expense/Liability
          // If Bank Credit (Money In) -> Debit Bank, Credit Revenue/Asset
          
          const isBankDebit = adjustmentTx.type === 'debit';
          
          await journalApi.createEntry({
              date: adjustmentTx.date,
              reference: `ADJ-${adjustmentTx.id}`,
              description: `Adj: ${adjustmentTx.description}`,
              type: 'adjustment',
              approvalStatus: 'pending',
              lines: [
                  { 
                      id: '1', 
                      accountId: '1000', // Assuming 1000 is Bank
                      description: adjustmentTx.description, 
                      debit: isBankDebit ? 0 : adjustmentTx.amount, // If Bank Credit (In), Debit Bank
                      credit: isBankDebit ? adjustmentTx.amount : 0 // If Bank Debit (Out), Credit Bank
                  },
                  { 
                      id: '2', 
                      accountId: adjustmentAccount, 
                      description: 'Adjustment Entry', 
                      debit: isBankDebit ? adjustmentTx.amount : 0, // Debit Expense
                      credit: isBankDebit ? 0 : adjustmentTx.amount // Credit Revenue
                  }
              ]
          });
          
          // Mark as matched/resolved
           setBankTransactions(bankTransactions.map(t => t.id === adjustmentTx.id ? { ...t, status: 'matched' as const } : t));
           
           setIsAdjustmentOpen(false);
           setAdjustmentTx(null);
           setAdjustmentAccount("");
           
           toast({ title: "Adjustment Created", description: "Journal Entry created and transaction resolved." });
      } catch (e) {
          console.error(e);
          toast({ title: "Error", description: "Failed to create adjustment", variant: "destructive" });
      } finally {
          setAdjustmentLoading(false);
      }
  };

  const bankBalance = 125430.00;
  const systemBalance = 123899.50;
  const difference = bankBalance - systemBalance;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
            <p className="text-muted-foreground">Match bank statement lines with system transactions.</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" /> Reports
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => window.print()}>
                        Print Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportCSV}>
                        Export CSV
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isConnectBankOpen} onOpenChange={setIsConnectBankOpen}>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                        <Globe className="mr-2 h-4 w-4" /> Connect Bank
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Connect Bank Feed</DialogTitle>
                        <DialogDescription>
                            Securely connect your bank account to automatically import transactions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleConnectBank("Capitec")} disabled={isConnecting}>
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">C</div>
                                Capitec
                            </Button>
                             <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleConnectBank("Standard Bank")} disabled={isConnecting}>
                                <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">S</div>
                                Standard Bank
                            </Button>
                             <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleConnectBank("Nedbank")} disabled={isConnecting}>
                                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">N</div>
                                Nedbank
                            </Button>
                             <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleConnectBank("FNB")} disabled={isConnecting}>
                                <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">F</div>
                                FNB
                            </Button>
                        </div>
                        {isConnecting && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <RefreshCw className="h-4 w-4 animate-spin" /> Connecting to bank...
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="relative">
                <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept=".csv,.ofx,.qif"
                    onChange={handleFileUpload}
                />
                <Button onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Statement
                </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Statement Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R {bankBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">As of {new Date().toLocaleDateString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R {systemBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">GL Account: 1000 - Main Bank</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Difference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${Math.abs(difference) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  R {Math.abs(difference).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{difference === 0 ? 'Balanced' : 'Unreconciled amount'}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
            <Label>Period:</Label>
            <Input type="date" className="w-auto" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span>to</span>
            <Input type="date" className="w-auto" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>

        <Tabs defaultValue="match" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="match">Match Transactions</TabsTrigger>
            <TabsTrigger value="flagged">Flagged Items</TabsTrigger>
            <TabsTrigger value="history">Reconciliation History</TabsTrigger>
          </TabsList>

          <TabsContent value="match" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle>Transaction Matching</CardTitle>
                    <CardDescription>Select one from each side to manually match, or use Auto-Match.</CardDescription>
                 </div>
                 <div className="flex gap-2">
                     <Button 
                        variant="secondary" 
                        onClick={handleManualMatch} 
                        disabled={!selectedBankTxId || !selectedSystemTxId}
                     >
                        <Link className="mr-2 h-4 w-4" /> Match Selected
                     </Button>
                     <Button onClick={autoMatch} className="bg-emerald-600 hover:bg-emerald-700">
                        <RefreshCw className="mr-2 h-4 w-4" /> Auto-Match
                     </Button>
                 </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Bank Side */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Bank Statement Lines
                    </h3>
                    <div className="rounded-md border h-[500px] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="w-[30px]"></TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bankTransactions.filter(t => t.status !== 'matched').map((tx) => (
                            <TableRow 
                                key={tx.id} 
                                className={`
                                    ${tx.status === 'flagged' ? 'bg-yellow-50/50' : ''} 
                                    ${selectedBankTxId === tx.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                                    cursor-pointer hover:bg-muted/50
                                `}
                                onClick={() => setSelectedBankTxId(tx.id === selectedBankTxId ? null : tx.id)}
                            >
                              <TableCell>
                                  <Checkbox checked={selectedBankTxId === tx.id} onCheckedChange={() => setSelectedBankTxId(tx.id === selectedBankTxId ? null : tx.id)} />
                              </TableCell>
                              <TableCell className="text-xs whitespace-nowrap">{tx.date}</TableCell>
                              <TableCell className="text-xs font-medium">{tx.description}</TableCell>
                              <TableCell className={`text-xs text-right ${tx.type === 'credit' ? 'text-green-600' : ''}`}>
                                {tx.amount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                    {tx.status !== 'flagged' && (
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => flagTransaction(tx.id)} title="Flag Discrepancy">
                                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                                        </Button>
                                    )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {bankTransactions.filter(t => t.status !== 'matched').length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                    All transactions matched!
                                </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* System Side */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4" /> System Ledger
                    </h3>
                    <div className="rounded-md border h-[500px] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="w-[30px]"></TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                           {systemTransactions.filter(t => t.status !== 'matched').map((tx) => (
                            <TableRow 
                                key={tx.id}
                                className={`
                                    ${selectedSystemTxId === tx.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                                    cursor-pointer hover:bg-muted/50
                                `}
                                onClick={() => setSelectedSystemTxId(tx.id === selectedSystemTxId ? null : tx.id)}
                            >
                              <TableCell>
                                  <Checkbox checked={selectedSystemTxId === tx.id} onCheckedChange={() => setSelectedSystemTxId(tx.id === selectedSystemTxId ? null : tx.id)} />
                              </TableCell>
                              <TableCell className="text-xs whitespace-nowrap">{tx.date}</TableCell>
                              <TableCell className="text-xs font-medium">{tx.description}</TableCell>
                              <TableCell className={`text-xs text-right ${tx.type === 'debit' ? 'text-green-600' : ''}`}>
                                {tx.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                           {systemTransactions.filter(t => t.status !== 'matched').length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                    All transactions matched!
                                </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flagged">
            <Card>
                <CardHeader>
                    <CardTitle>Flagged Discrepancies</CardTitle>
                    <CardDescription>Items requiring manual review or adjustment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bankTransactions.filter(t => t.status === 'flagged').map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell>{tx.description}</TableCell>
                                    <TableCell>{tx.amount.toFixed(2)}</TableCell>
                                    <TableCell><Badge variant="secondary">Needs Review</Badge></TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline" onClick={() => openAdjustmentDialog(tx)}>Create Adjustment</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {bankTransactions.filter(t => t.status === 'flagged').length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">No flagged items.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
              <Card>
                  <CardHeader>
                      <CardTitle>Reconciliation History</CardTitle>
                      <CardDescription>Past reconciliation reports.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Period Ending</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Statement Balance</TableHead>
                                  <TableHead>Difference</TableHead>
                                  <TableHead>Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              <TableRow>
                                  <TableCell>29 Feb 2024</TableCell>
                                  <TableCell><Badge className="bg-green-600">Reconciled</Badge></TableCell>
                                  <TableCell>R 118,200.00</TableCell>
                                  <TableCell>R 0.00</TableCell>
                                  <TableCell>
                                      <Button variant="ghost" size="sm"><Download className="h-4 w-4 mr-2" /> PDF</Button>
                                  </TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell>31 Jan 2024</TableCell>
                                  <TableCell><Badge className="bg-green-600">Reconciled</Badge></TableCell>
                                  <TableCell>R 105,450.00</TableCell>
                                  <TableCell>R 0.00</TableCell>
                                  <TableCell>
                                      <Button variant="ghost" size="sm"><Download className="h-4 w-4 mr-2" /> PDF</Button>
                                  </TableCell>
                              </TableRow>
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>

        {/* Adjustment Dialog */}
        <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Adjustment</DialogTitle>
                    <DialogDescription>
                        Create a journal entry to resolve this discrepancy.
                    </DialogDescription>
                </DialogHeader>
                {adjustmentTx && (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-semibold">Date:</span> <span>{adjustmentTx.date}</span>
                            <span className="font-semibold">Description:</span> <span>{adjustmentTx.description}</span>
                            <span className="font-semibold">Amount:</span> <span>{adjustmentTx.amount.toFixed(2)} ({adjustmentTx.type})</span>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Offset Account</Label>
                            <Select value={adjustmentAccount} onValueChange={setAdjustmentAccount}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="6000">6000 - Operating Expenses</SelectItem>
                                    <SelectItem value="4000">4000 - Sales Revenue</SelectItem>
                                    <SelectItem value="5000">5000 - Cost of Goods Sold</SelectItem>
                                    <SelectItem value="2000">2000 - Accounts Payable</SelectItem>
                                    <SelectItem value="1100">1100 - Accounts Receivable</SelectItem>
                                    <SelectItem value="1500">1500 - Accumulated Depreciation</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Select the account to balance against the bank entry.
                            </p>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAdjustmentOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateAdjustment} disabled={!adjustmentAccount || adjustmentLoading}>
                        {adjustmentLoading ? "Creating..." : "Create Journal Entry"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </MainLayout>
  );
}
