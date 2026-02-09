
import { useState, useRef, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Download, Edit2, Trash2, FolderTree, Upload, History } from "lucide-react";
import { chartOfAccountsApi, Account, SA_CHART_OF_ACCOUNTS } from "@/lib/chart-of-accounts-api";

import { auditLogger } from "@/lib/audit-logger";

export default function ChartOfAccounts() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({ isActive: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAccounts = useCallback(async () => {
    try {
        const data = await chartOfAccountsApi.getAccounts();
        setAccounts(data.sort((a, b) => a.code.localeCompare(b.code)));
    } catch (error) {
        toast({ title: "Error", description: "Failed to load accounts.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    acc.code.includes(searchQuery)
  );

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      user: 'Current User', // In a real app, get from auth context
      timestamp: new Date()
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleAddAccount = async () => {
    if (!newAccount.code || !newAccount.name || !newAccount.type) {
        toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
        return;
    }

    const account: Account = {
      id: Math.random().toString(36).substr(2, 9),
      code: newAccount.code,
      name: newAccount.name,
      type: newAccount.type as Account['type'],
      subtype: newAccount.subtype || 'General',
      isActive: newAccount.isActive || true,
      description: newAccount.description
    };

    await chartOfAccountsApi.saveAccount(account);
    await loadAccounts(); // Reload to ensure sync
    
    addAuditLog('Create Account', `Created account ${account.code} - ${account.name}`);
    setIsAddOpen(false);
    setNewAccount({ isActive: true });
    toast({
      title: "Account Created",
      description: `${account.code} - ${account.name} added successfully.`,
    });
  };

  const handleDeleteAccount = async (id: string) => {
      // In a real app, check if account has transactions first
      await chartOfAccountsApi.deleteAccount(id);
      await loadAccounts();
      addAuditLog('Deactivate Account', `Deactivated account ${id}`);
      toast({ title: "Account Deactivated", description: "Account marked inactive (not deleted)." });
  }

  const handleExport = () => {
    const headers = ["Code", "Name", "Type", "Subtype", "Status", "Description"];
    const csvRows = [headers];
    
    accounts.forEach(acc => {
      csvRows.push([
        acc.code,
        acc.name,
        acc.type,
        acc.subtype,
        acc.isActive ? "Active" : "Inactive",
        acc.description || ""
      ]);
    });
    
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "chart_of_accounts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addAuditLog('Export Data', 'Exported Chart of Accounts to CSV');
    toast({ title: "Export Successful", description: "Chart of Accounts downloaded." });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split('\n');
        // Skip header row
        const newAccounts: Account[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const [code, name, type, subtype, status, description] = line.split(',');
          
          if (code && name && type) {
             newAccounts.push({
                id: Math.random().toString(36).substr(2, 9),
                code,
                name,
                type: type.toLowerCase() as Account['type'],
                subtype: subtype || 'General',
                isActive: status?.toLowerCase() === 'active',
                description
             });
          }
        }
        
        if (newAccounts.length > 0) {
            // Check for duplicates
            const currentAccounts = await chartOfAccountsApi.getAccounts();
            const existingCodes = new Set(currentAccounts.map(a => a.code));
            
            let addedCount = 0;
            for (const acc of newAccounts) {
                if (!existingCodes.has(acc.code)) {
                    await chartOfAccountsApi.saveAccount(acc);
                    addedCount++;
                }
            }
            
            await loadAccounts();
            
            if (addedCount > 0) {
                addAuditLog('Import Data', `Imported ${addedCount} accounts from CSV`);
                toast({ title: "Import Successful", description: `Processed ${addedCount} new accounts.` });
            } else {
                toast({ title: "Import Completed", description: "No new accounts added (all duplicates).", variant: "default" });
            }
        } else {
            toast({ title: "Import Failed", description: "No valid accounts found in CSV.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Import Error", description: "Failed to parse CSV file.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const loadSAChartOfAccounts = async () => {
    try {
      const inserted = await chartOfAccountsApi.seedDefaultSAChart();
      await loadAccounts();
      addAuditLog('Seed Accounts', `Loaded Default SA Chart (${inserted} new accounts)`);
      toast({ title: 'Default SA Chart Loaded', description: inserted > 0 ? `${inserted} accounts added.` : 'All accounts already present.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to load default chart.', variant: 'destructive' });
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
        case 'asset': return 'bg-blue-100 text-blue-800';
        case 'liability': return 'bg-red-100 text-red-800';
        case 'equity': return 'bg-purple-100 text-purple-800';
        case 'revenue': return 'bg-green-100 text-green-800';
        case 'expense': return 'bg-amber-100 text-amber-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
            <p className="text-muted-foreground">Manage your organization's general ledger accounts.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportClick}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv" 
              onChange={handleImportFile} 
            />
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                  <DialogDescription>
                    Create a new account in your chart of accounts.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">
                      Code
                    </Label>
                    <Input
                      id="code"
                      value={newAccount.code || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                      className="col-span-3"
                      placeholder="e.g. 1000"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newAccount.name || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      className="col-span-3"
                      placeholder="e.g. Cash in Bank"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select 
                      value={newAccount.type} 
                      onValueChange={(val: Account['type']) => setNewAccount({ ...newAccount, type: val })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="liability">Liability</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subtype" className="text-right">
                      Subtype
                    </Label>
                    <Input
                      id="subtype"
                      value={newAccount.subtype || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, subtype: e.target.value })}
                      className="col-span-3"
                      placeholder="e.g. Current Asset"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="desc" className="text-right">
                      Desc
                    </Label>
                    <Input
                      id="desc"
                      value={newAccount.description || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                      className="col-span-3"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddAccount}>Save Account</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList>
            <TabsTrigger value="accounts" className="gap-2">
              <FolderTree className="h-4 w-4" /> Accounts
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <History className="h-4 w-4" /> Audit Log
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
              <CardTitle>Accounts List</CardTitle>
              <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search accounts..." 
                      className="pl-8" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subtype</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center space-y-3">
                        <div>No accounts found.</div>
                        <Button variant="outline" onClick={loadSAChartOfAccounts}>
                          Load Default SA Chart
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getTypeColor(account.type)}>
                            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{account.subtype}</TableCell>
                        <TableCell>
                          <Badge variant={account.isActive ? "default" : "destructive"}>
                            {account.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteAccount(account.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
          </TabsContent>
          
          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>View history of changes to the Chart of Accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {log.timestamp.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell>{log.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
