
import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, Calculator, Printer, Download, PiggyBank, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";
import { Chatbot } from "@/components/Shared/Chatbot";
import { DeleteConfirmationDialog } from "@/components/Shared/DeleteConfirmationDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Loan {
  id: string;
  loan_number: string;
  borrower_name: string;
  lender: string;
  principal_amount: number;
  interest_rate: number;
  term_months: number;
  start_date: string;
  monthly_payment: number;
  status: string;
  remaining_balance: number;
}

interface AmortizationEntry {
  paymentNumber: number;
  paymentDate: string;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

const LoanManagement = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationEntry[]>([]);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("loans");
  const [loanForm, setLoanForm] = useState({
    borrower_name: "",
    lender: "",
    principal_amount: "",
    interest_rate: "",
    term_months: "",
    start_date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      // Use localStorage since loans table doesn't exist in DB
      const stored = localStorage.getItem('rigel_loans');
      if (stored) {
        setLoans(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch loans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchLoans();
    }
  }, [user, fetchLoans]);

  const saveLoans = (newLoans: Loan[]) => {
    localStorage.setItem('rigel_loans', JSON.stringify(newLoans));
    setLoans(newLoans);
  };

  const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
    if (rate === 0) return principal / months;
    const monthlyRate = rate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  const generateAmortizationSchedule = (loan: Loan) => {
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = loan.principal_amount;
    const monthlyRate = loan.interest_rate / 100 / 12;
    
    for (let i = 1; i <= loan.term_months; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = loan.monthly_payment - interestPayment;
      remainingBalance -= principalPayment;
      
      const paymentDate = new Date(loan.start_date);
      paymentDate.setMonth(paymentDate.getMonth() + i - 1);
      
      schedule.push({
        paymentNumber: i,
        paymentDate: paymentDate.toISOString().split('T')[0],
        principalPayment,
        interestPayment,
        totalPayment: loan.monthly_payment,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }
    
    return schedule;
  };

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const principal = parseFloat(loanForm.principal_amount);
    const rate = parseFloat(loanForm.interest_rate);
    const months = parseInt(loanForm.term_months);
    
    const monthlyPayment = calculateMonthlyPayment(principal, rate, months);
    
    try {
      if (selectedLoan) {
        // Update existing loan in localStorage
        const updatedLoans = loans.map(l => 
          l.id === selectedLoan.id 
            ? {
                ...l,
                borrower_name: loanForm.borrower_name,
                lender: loanForm.lender,
                principal_amount: principal,
                interest_rate: rate,
                term_months: months,
                start_date: loanForm.start_date,
                monthly_payment: monthlyPayment,
              }
            : l
        );
        saveLoans(updatedLoans);
        toast({ title: "Success", description: "Loan updated successfully" });
      } else {
        // Create new loan in localStorage
        const newLoan: Loan = {
          id: crypto.randomUUID(),
          loan_number: `LOAN-${Date.now().toString().slice(-6)}`,
          borrower_name: loanForm.borrower_name,
          lender: loanForm.lender,
          principal_amount: principal,
          interest_rate: rate,
          term_months: months,
          start_date: loanForm.start_date,
          monthly_payment: monthlyPayment,
          status: "active",
          remaining_balance: principal,
        };
        saveLoans([newLoan, ...loans]);
        toast({ title: "Success", description: "Loan added successfully" });
      }
      
      setLoanForm({
        borrower_name: "",
        lender: "",
        principal_amount: "",
        interest_rate: "",
        term_months: "",
        start_date: new Date().toISOString().split('T')[0],
      });
      setShowLoanForm(false);
      setSelectedLoan(null);
    } catch (error) {
      console.error('Error saving loan:', error);
      toast({
        title: "Error",
        description: "Failed to save loan",
        variant: "destructive",
      });
    }
  };

  const handleEditLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setLoanForm({
      borrower_name: loan.borrower_name,
      lender: loan.lender,
      principal_amount: loan.principal_amount.toString(),
      interest_rate: loan.interest_rate.toString(),
      term_months: loan.term_months.toString(),
      start_date: loan.start_date,
    });
    setShowLoanForm(true);
    setActiveTab("loans");
  };

  const handleDeleteClick = (loan: Loan) => {
    setLoanToDelete(loan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (loanToDelete) {
      try {
        const filteredLoans = loans.filter(l => l.id !== loanToDelete.id);
        saveLoans(filteredLoans);
        
        toast({ title: "Success", description: "Loan deleted successfully" });
        
        if (selectedLoan?.id === loanToDelete.id) {
          setSelectedLoan(null);
          setAmortizationSchedule([]);
        }
      } catch (error) {
        console.error('Error deleting loan:', error);
        toast({
          title: "Error",
          description: "Failed to delete loan",
          variant: "destructive",
        });
      } finally {
        setLoanToDelete(null);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const viewAmortizationSchedule = (loan: Loan) => {
    setSelectedLoan(loan);
    const schedule = generateAmortizationSchedule(loan);
    setAmortizationSchedule(schedule);
    setActiveTab("amortization");
  };

  const handlePrint = () => {
    if (activeTab === 'amortization' && selectedLoan) {
      printTable('amortization-table', `Amortization Schedule - ${selectedLoan.loan_number}`);
    } else {
      printTable('loans-table', 'Loans Summary');
    }
  };

  const handleExportCSV = () => {
    if (activeTab === 'amortization' && selectedLoan && amortizationSchedule.length > 0) {
      const headers = ['Payment #', 'Date', 'Principal', 'Interest', 'Total Payment', 'Balance'];
      exportToCSV(amortizationSchedule, `amortization_${selectedLoan.loan_number}`, headers);
    } else {
      const headers = ['Loan Number', 'Borrower', 'Lender', 'Principal', 'Rate', 'Monthly Payment', 'Status'];
      exportToCSV(loans, 'loans_summary', headers);
    }
  };

  const handleExportJSON = () => {
    if (activeTab === 'amortization' && selectedLoan && amortizationSchedule.length > 0) {
      exportToJSON(amortizationSchedule, `amortization_${selectedLoan.loan_number}`);
    } else {
      exportToJSON(loans, 'loans_summary');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Loan Management</h1>
            <p className="text-muted-foreground">Manage loans and amortization schedules</p>
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
            <Button onClick={() => {
              setSelectedLoan(null);
              setLoanForm({
                borrower_name: "",
                lender: "",
                principal_amount: "",
                interest_rate: "",
                term_months: "",
                start_date: new Date().toISOString().split('T')[0],
              });
              setShowLoanForm(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Loan
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="loans">Loan Register</TabsTrigger>
            <TabsTrigger value="amortization">Amortization Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="space-y-4">
            {showLoanForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedLoan ? 'Edit Loan' : 'Add New Loan'}</CardTitle>
                  <CardDescription>Enter loan details to calculate payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoanSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="borrowerName">Borrower Name</Label>
                      <Input
                        id="borrowerName"
                        value={loanForm.borrower_name}
                        onChange={(e) => setLoanForm({...loanForm, borrower_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lender">Lender</Label>
                      <Input
                        id="lender"
                        value={loanForm.lender}
                        onChange={(e) => setLoanForm({...loanForm, lender: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="principal">Principal Amount (R)</Label>
                      <Input
                        id="principal"
                        type="number"
                        step="0.01"
                        value={loanForm.principal_amount}
                        onChange={(e) => setLoanForm({...loanForm, principal_amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate">Interest Rate (%)</Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.01"
                        value={loanForm.interest_rate}
                        onChange={(e) => setLoanForm({...loanForm, interest_rate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="months">Term (Months)</Label>
                      <Input
                        id="months"
                        type="number"
                        value={loanForm.term_months}
                        onChange={(e) => setLoanForm({...loanForm, term_months: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={loanForm.start_date}
                        onChange={(e) => setLoanForm({...loanForm, start_date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setShowLoanForm(false)}>Cancel</Button>
                      <Button type="submit">{selectedLoan ? 'Update Loan' : 'Save Loan'}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Active Loans</CardTitle>
                <CardDescription>Overview of all registered loans</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading loans...</div>
                ) : (
                  <Table id="loans-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan Number</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Lender</TableHead>
                        <TableHead className="text-right">Principal</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Monthly Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.loan_number}</TableCell>
                          <TableCell>{loan.borrower_name}</TableCell>
                          <TableCell>{loan.lender}</TableCell>
                          <TableCell className="text-right">R {loan.principal_amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{loan.interest_rate}%</TableCell>
                          <TableCell className="text-right">R {loan.monthly_payment.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => viewAmortizationSchedule(loan)} title="View Schedule">
                                <Calculator className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditLoan(loan)} title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(loan)} title="Delete">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {loans.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No loans found. Create your first loan to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amortization">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-4 flex-1">
                  <div>
                    <CardTitle>Amortization Schedule</CardTitle>
                    <CardDescription>
                      {selectedLoan 
                        ? `Schedule for ${selectedLoan.loan_number} (${selectedLoan.borrower_name})`
                        : "Select a loan to view its amortization schedule"}
                    </CardDescription>
                  </div>
                  <div className="w-full max-w-sm">
                    <Select 
                      value={selectedLoan?.id} 
                      onValueChange={(value) => {
                        const loan = loans.find(l => l.id === value);
                        if (loan) viewAmortizationSchedule(loan);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a loan to view schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {loans.map((loan) => (
                          <SelectItem key={loan.id} value={loan.id}>
                            {loan.loan_number} - {loan.borrower_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedLoan && (
                  <Badge variant="outline" className="text-lg ml-4">
                    R {selectedLoan.monthly_payment.toLocaleString()} / month
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {selectedLoan ? (
                  <Table id="amortization-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Principal</TableHead>
                        <TableHead className="text-right">Interest</TableHead>
                        <TableHead className="text-right">Total Payment</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {amortizationSchedule.map((entry) => (
                        <TableRow key={entry.paymentNumber}>
                          <TableCell>{entry.paymentNumber}</TableCell>
                          <TableCell>{entry.paymentDate}</TableCell>
                          <TableCell className="text-right">R {entry.principalPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                          <TableCell className="text-right">R {entry.interestPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                          <TableCell className="text-right">R {entry.totalPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                          <TableCell className="text-right">R {entry.remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Please select a loan from the Loan Register to view the schedule.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("loans")}>
                      Go to Loan Register
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DeleteConfirmationDialog 
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Loan"
          description={`Are you sure you want to delete loan ${loanToDelete?.loan_number}? This action cannot be undone.`}
        />
      </div>
    </MainLayout>
  );
};

export default LoanManagement;
