import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck, Plus, Search, Edit, Trash2, Printer, Download, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chatbot } from "@/components/Shared/Chatbot";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Director {
  id: string;
  name: string;
  idNumber: string;
  email: string;
  phone: string;
  appointmentDate: string;
  shareholding: number;
  isActive: boolean;
}

interface DirectorTransaction {
  id: string;
  directorId: string;
  directorName: string;
  date: string;
  type: 'loan_to_director' | 'loan_from_director' | 'salary' | 'dividend' | 'expense_reimbursement';
  amount: number;
  description: string;
  reference: string;
}

const DirectorTransactions = () => {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [transactions, setTransactions] = useState<DirectorTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDirector, setShowAddDirector] = useState(false);
  const [activeTab, setActiveTab] = useState("directors");
  const [directorForm, setDirectorForm] = useState({
    name: "",
    idNumber: "",
    email: "",
    phone: "",
    appointmentDate: "",
    shareholding: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with empty data - will be populated with real data in future
    setDirectors([]);
    setTransactions([]);
  }, []);

  const filteredDirectors = directors.filter(director =>
    director.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    director.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(transaction =>
    transaction.directorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintDirectors = () => {
    printTable('directors-table', 'Directors List');
  };

  const handlePrintTransactions = () => {
    printTable('transactions-table', 'Director Transactions');
  };

  const handleExportDirectorsCSV = () => {
    const headers = ['Name', 'ID Number', 'Email', 'Phone', 'Shareholding', 'Active'];
    const records = filteredDirectors.map(d => ({
      name: d.name,
      id_number: d.idNumber,
      email: d.email,
      phone: d.phone,
      shareholding: d.shareholding,
      active: d.isActive ? 'Yes' : 'No',
    }));
    exportToCSV(records, 'directors', headers);
  };

  const handleExportTransactionsCSV = () => {
    const headers = ['Date', 'Director', 'Type', 'Amount', 'Description', 'Reference'];
    const records = filteredTransactions.map(t => ({
      date: t.date,
      director: t.directorName,
      type: t.type,
      amount: t.amount,
      description: t.description,
      reference: t.reference,
    }));
    exportToCSV(records, 'director-transactions', headers);
  };

  const handleAddDirector = (e: React.FormEvent) => {
    e.preventDefault();
    setDirectors([
      ...directors,
      {
        id: Date.now().toString(),
        name: directorForm.name,
        idNumber: directorForm.idNumber,
        email: directorForm.email,
        phone: directorForm.phone,
        appointmentDate: directorForm.appointmentDate,
        shareholding: Number(directorForm.shareholding),
        isActive: true,
      }
    ]);
    setShowAddDirector(false);
    setDirectorForm({
      name: "",
      idNumber: "",
      email: "",
      phone: "",
      appointmentDate: "",
      shareholding: "",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Director Transactions</h1>
            <p className="text-muted-foreground">Manage directors and track their financial transactions</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="directors">Directors</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="directors">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search directors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={handlePrintDirectors}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={handleExportDirectorsCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button onClick={() => setShowAddDirector(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Director
                  </Button>
                </div>
              </div>

              {/* Add Director Form (Dialog) */}
              <Dialog open={showAddDirector} onOpenChange={setShowAddDirector}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Director</DialogTitle>
                    <DialogDescription>Provide the new director's details.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddDirector} className="space-y-4 mt-2">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={directorForm.name} onChange={e => setDirectorForm({ ...directorForm, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="idNumber">ID Number</Label>
                      <Input id="idNumber" value={directorForm.idNumber} onChange={e => setDirectorForm({ ...directorForm, idNumber: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={directorForm.email} onChange={e => setDirectorForm({ ...directorForm, email: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={directorForm.phone} onChange={e => setDirectorForm({ ...directorForm, phone: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="appointmentDate">Appointment Date</Label>
                      <Input id="appointmentDate" type="date" value={directorForm.appointmentDate} onChange={e => setDirectorForm({ ...directorForm, appointmentDate: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="shareholding">Shareholding (%)</Label>
                      <Input id="shareholding" type="number" value={directorForm.shareholding} onChange={e => setDirectorForm({ ...directorForm, shareholding: e.target.value })} required min={0} max={100} step="0.01" />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddDirector(false)}>Cancel</Button>
                      <Button type="submit">Add</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Directors ({filteredDirectors.length})
                  </CardTitle>
                  <CardDescription>
                    Manage company directors and their information
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table id="directors-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>ID Number</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Appointment Date</TableHead>
                          <TableHead>Shareholding</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDirectors.map((director) => (
                          <TableRow key={director.id}>
                            <TableCell className="font-medium">{director.name}</TableCell>
                            <TableCell>{director.idNumber}</TableCell>
                            <TableCell>{director.email}</TableCell>
                            <TableCell>{director.phone}</TableCell>
                            <TableCell>{new Date(director.appointmentDate).toLocaleDateString()}</TableCell>
                            <TableCell>{director.shareholding}%</TableCell>
                            <TableCell>
                              <Badge variant={director.isActive ? "default" : "secondary"}>
                                {director.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Edit Director", 
                                      description: "Edit functionality will be available in a future update"
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Delete Director",
                                      description: "Delete functionality will be available in a future update",
                                      variant: "destructive",
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={handlePrintTransactions}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={handleExportTransactionsCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={() => {
                      toast({
                        title: "New Transaction",
                        description: "Transaction creation form will be available in a future update",
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Transaction
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Loans to Directors</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      R{transactions
                        .filter(t => t.type === 'loan_to_director')
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Dividends Paid</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      R{transactions
                        .filter(t => t.type === 'dividend')
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{transactions.length}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Director Transactions ({filteredTransactions.length})
                  </CardTitle>
                  <CardDescription>
                    Track all financial transactions with directors
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table id="transactions-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Director</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{transaction.directorName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transaction.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.reference}</TableCell>
                            <TableCell className="text-right">R{transaction.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Edit Transaction",
                                      description: "Transaction editing will be available in a future update",
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Delete Transaction",
                                      description: "Transaction deletion will be available in a future update",
                                      variant: "destructive",
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default DirectorTransactions;
