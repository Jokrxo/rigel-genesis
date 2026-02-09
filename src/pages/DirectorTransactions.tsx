import { useState, useEffect, useCallback } from "react";
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
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// This module references optional tables (e.g. directors) that may not exist in all deployments.
// Casting prevents generated DB types from failing the entire build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = supabaseClient;
import { DeleteConfirmationDialog } from "@/components/Shared/DeleteConfirmationDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDirector, setShowAddDirector] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditDirector, setShowEditDirector] = useState(false);
  const [showDeleteDirector, setShowDeleteDirector] = useState(false);
  const [showEditTransaction, setShowEditTransaction] = useState(false);
  const [showDeleteTransaction, setShowDeleteTransaction] = useState(false);
  const [activeTab, setActiveTab] = useState("directors");
  
  const [editingDirectorId, setEditingDirectorId] = useState<string | null>(null);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [selectedDirector, setSelectedDirector] = useState<Director | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<DirectorTransaction | null>(null);

  const [directorForm, setDirectorForm] = useState({
    name: "",
    idNumber: "",
    email: "",
    phone: "",
    appointmentDate: "",
    shareholding: "",
  });

  const [transactionForm, setTransactionForm] = useState({
    directorId: "",
    date: new Date().toISOString().split('T')[0],
    type: "loan_to_director",
    amount: "",
    description: "",
    reference: "",
  });

  const { toast } = useToast();

  const fetchDirectors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('directors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDirectors(data.map(d => ({
        id: d.id,
        name: d.name,
        idNumber: d.id_number,
        email: d.email,
        phone: d.phone,
        appointmentDate: d.appointment_date,
        shareholding: d.shareholding,
        isActive: d.is_active
      })));
    } catch (error) {
      console.error('Error fetching directors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch directors",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('director_transactions')
        .select(`
          *,
          director:directors(name)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data.map(t => ({
        id: t.id,
        directorId: t.director_id,
        directorName: t.director?.name || 'Unknown',
        date: t.date,
        type: t.type,
        amount: t.amount,
        description: t.description,
        reference: t.reference
      })));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDirectors(), fetchTransactions()]);
      setLoading(false);
    };
    loadData();
  }, [fetchDirectors, fetchTransactions]);

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

  const handleAddDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingDirectorId) {
        const { error } = await supabase
          .from('directors')
          .update({
            name: directorForm.name,
            id_number: directorForm.idNumber,
            email: directorForm.email,
            phone: directorForm.phone,
            appointment_date: directorForm.appointmentDate,
            shareholding: Number(directorForm.shareholding),
          })
          .eq('id', editingDirectorId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Director updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('directors')
          .insert([{
            user_id: user.id,
            name: directorForm.name,
            id_number: directorForm.idNumber,
            email: directorForm.email,
            phone: directorForm.phone,
            appointment_date: directorForm.appointmentDate,
            shareholding: Number(directorForm.shareholding),
            is_active: true
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Director added successfully",
        });
      }
      
      setShowAddDirector(false);
      setEditingDirectorId(null);
      setDirectorForm({
        name: "",
        idNumber: "",
        email: "",
        phone: "",
        appointmentDate: "",
        shareholding: "",
      });
      fetchDirectors();
    } catch (error) {
      console.error('Error saving director:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingDirectorId ? 'update' : 'add'} director`,
        variant: "destructive",
      });
    }
  };

  // Removed duplicate handleEditDirector

  // Removed duplicate handleDeleteDirector

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingTransactionId) {
        const { error } = await supabase
          .from('director_transactions')
          .update({
            director_id: transactionForm.directorId,
            date: transactionForm.date,
            type: transactionForm.type,
            amount: Number(transactionForm.amount),
            description: transactionForm.description,
            reference: transactionForm.reference
          })
          .eq('id', editingTransactionId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Transaction updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('director_transactions')
          .insert([{
            user_id: user.id,
            director_id: transactionForm.directorId,
            date: transactionForm.date,
            type: transactionForm.type,
            amount: Number(transactionForm.amount),
            description: transactionForm.description,
            reference: transactionForm.reference
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Transaction added successfully",
        });
      }

      setShowAddTransaction(false);
      setEditingTransactionId(null);
      setTransactionForm({
        directorId: "",
        date: new Date().toISOString().split('T')[0],
        type: "loan_to_director",
        amount: "",
        description: "",
        reference: "",
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingTransactionId ? 'update' : 'add'} transaction`,
        variant: "destructive",
      });
    }
  };

  // Removed duplicate handleEditTransaction

  // Removed duplicate handleDeleteTransaction

  const handleEditDirector = (director: Director) => {
    setSelectedDirector(director);
    setDirectorForm({
      name: director.name,
      idNumber: director.idNumber,
      email: director.email,
      phone: director.phone,
      appointmentDate: director.appointmentDate,
      shareholding: director.shareholding.toString(),
    });
    setShowEditDirector(true);
  };

  const handleUpdateDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDirector) return;

    try {
      const { error } = await supabase
        .from('directors')
        .update({
          name: directorForm.name,
          id_number: directorForm.idNumber,
          email: directorForm.email,
          phone: directorForm.phone,
          appointment_date: directorForm.appointmentDate,
          shareholding: Number(directorForm.shareholding),
        })
        .eq('id', selectedDirector.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Director updated successfully",
      });
      
      setShowEditDirector(false);
      fetchDirectors();
    } catch (error) {
      console.error('Error updating director:', error);
      toast({
        title: "Error",
        description: "Failed to update director",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDirector = (director: Director) => {
    setSelectedDirector(director);
    setShowDeleteDirector(true);
  };

  const handleConfirmDeleteDirector = async () => {
    if (!selectedDirector) return;

    try {
      const { error } = await supabase
        .from('directors')
        .delete()
        .eq('id', selectedDirector.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Director deleted successfully",
      });
      
      setShowDeleteDirector(false);
      fetchDirectors();
    } catch (error) {
      console.error('Error deleting director:', error);
      toast({
        title: "Error",
        description: "Failed to delete director. Ensure there are no linked transactions.",
        variant: "destructive",
      });
    }
  };

  const handleEditTransaction = (transaction: DirectorTransaction) => {
    setSelectedTransaction(transaction);
    setTransactionForm({
      directorId: transaction.directorId,
      date: transaction.date,
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      reference: transaction.reference,
    });
    setShowEditTransaction(true);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    try {
      const { error } = await supabase
        .from('director_transactions')
        .update({
          director_id: transactionForm.directorId,
          date: transactionForm.date,
          type: transactionForm.type,
          amount: Number(transactionForm.amount),
          description: transactionForm.description,
          reference: transactionForm.reference
        })
        .eq('id', selectedTransaction.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });

      setShowEditTransaction(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = (transaction: DirectorTransaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteTransaction(true);
  };

  const handleConfirmDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      const { error } = await supabase
        .from('director_transactions')
        .delete()
        .eq('id', selectedTransaction.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });

      setShowDeleteTransaction(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
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

              {/* Edit Director Form (Dialog) */}
              <Dialog open={showEditDirector} onOpenChange={setShowEditDirector}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Director</DialogTitle>
                    <DialogDescription>Update the director's details.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateDirector} className="space-y-4 mt-2">
                    <div>
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input id="edit-name" value={directorForm.name} onChange={e => setDirectorForm({ ...directorForm, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-idNumber">ID Number</Label>
                      <Input id="edit-idNumber" value={directorForm.idNumber} onChange={e => setDirectorForm({ ...directorForm, idNumber: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input id="edit-email" type="email" value={directorForm.email} onChange={e => setDirectorForm({ ...directorForm, email: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input id="edit-phone" value={directorForm.phone} onChange={e => setDirectorForm({ ...directorForm, phone: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-appointmentDate">Appointment Date</Label>
                      <Input id="edit-appointmentDate" type="date" value={directorForm.appointmentDate} onChange={e => setDirectorForm({ ...directorForm, appointmentDate: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-shareholding">Shareholding (%)</Label>
                      <Input id="edit-shareholding" type="number" value={directorForm.shareholding} onChange={e => setDirectorForm({ ...directorForm, shareholding: e.target.value })} required min={0} max={100} step="0.01" />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowEditDirector(false)}>Cancel</Button>
                      <Button type="submit">Update</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <DeleteConfirmationDialog 
                open={showDeleteDirector} 
                onClose={() => setShowDeleteDirector(false)} 
                onConfirm={handleConfirmDeleteDirector} 
                title="Delete Director"
                description="Are you sure you want to delete this director? This action cannot be undone."
              />

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
                        {filteredDirectors.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No directors found. Add one to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDirectors.map((director) => (
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
                                    onClick={() => handleEditDirector(director)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteDirector(director)}
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
                  <Button onClick={() => setShowAddTransaction(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Transaction
                  </Button>
                </div>
              </div>

              {/* Add Transaction Form (Dialog) */}
              <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>Record a new transaction for a director.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddTransaction} className="space-y-4 mt-2">
                    <div>
                      <Label htmlFor="director">Director</Label>
                      <Select 
                        value={transactionForm.directorId} 
                        onValueChange={(val) => setTransactionForm({ ...transactionForm, directorId: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select director" />
                        </SelectTrigger>
                        <SelectContent>
                          {directors.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" value={transactionForm.date} onChange={e => setTransactionForm({ ...transactionForm, date: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="type">Transaction Type</Label>
                      <Select 
                        value={transactionForm.type} 
                        onValueChange={(val) => setTransactionForm({ ...transactionForm, type: val as DirectorTransaction['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loan_to_director">Loan to Director</SelectItem>
                          <SelectItem value="loan_from_director">Loan from Director</SelectItem>
                          <SelectItem value="salary">Salary</SelectItem>
                          <SelectItem value="dividend">Dividend</SelectItem>
                          <SelectItem value="expense_reimbursement">Expense Reimbursement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (R)</Label>
                      <Input id="amount" type="number" step="0.01" value={transactionForm.amount} onChange={e => setTransactionForm({ ...transactionForm, amount: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" value={transactionForm.description} onChange={e => setTransactionForm({ ...transactionForm, description: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="reference">Reference</Label>
                      <Input id="reference" value={transactionForm.reference} onChange={e => setTransactionForm({ ...transactionForm, reference: e.target.value })} />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddTransaction(false)}>Cancel</Button>
                      <Button type="submit">Add</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Edit Transaction Form (Dialog) */}
              <Dialog open={showEditTransaction} onOpenChange={setShowEditTransaction}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>Update the transaction details.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateTransaction} className="space-y-4 mt-2">
                    <div>
                      <Label htmlFor="edit-director">Director</Label>
                      <Select 
                        value={transactionForm.directorId} 
                        onValueChange={(val) => setTransactionForm({ ...transactionForm, directorId: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select director" />
                        </SelectTrigger>
                        <SelectContent>
                          {directors.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-date">Date</Label>
                      <Input id="edit-date" type="date" value={transactionForm.date} onChange={e => setTransactionForm({ ...transactionForm, date: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-type">Transaction Type</Label>
                      <Select 
                        value={transactionForm.type} 
                        onValueChange={(val) => setTransactionForm({ ...transactionForm, type: val as DirectorTransaction['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loan_to_director">Loan to Director</SelectItem>
                          <SelectItem value="loan_from_director">Loan from Director</SelectItem>
                          <SelectItem value="salary">Salary</SelectItem>
                          <SelectItem value="dividend">Dividend</SelectItem>
                          <SelectItem value="expense_reimbursement">Expense Reimbursement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-amount">Amount (R)</Label>
                      <Input id="edit-amount" type="number" step="0.01" value={transactionForm.amount} onChange={e => setTransactionForm({ ...transactionForm, amount: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Input id="edit-description" value={transactionForm.description} onChange={e => setTransactionForm({ ...transactionForm, description: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="edit-reference">Reference</Label>
                      <Input id="edit-reference" value={transactionForm.reference} onChange={e => setTransactionForm({ ...transactionForm, reference: e.target.value })} />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowEditTransaction(false)}>Cancel</Button>
                      <Button type="submit">Update</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <DeleteConfirmationDialog 
                open={showDeleteTransaction} 
                onClose={() => setShowDeleteTransaction(false)} 
                onConfirm={handleConfirmDeleteTransaction} 
                title="Delete Transaction"
                description="Are you sure you want to delete this transaction? This action cannot be undone."
              />

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
                        {filteredTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No transactions found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTransactions.map((transaction) => (
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
                                    onClick={() => handleEditTransaction(transaction)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteTransaction(transaction)}
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default DirectorTransactions;