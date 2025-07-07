
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, Calculator, Printer, Download, PiggyBank } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";
import { Chatbot } from "@/components/Shared/Chatbot";

interface Loan {
  id: string;
  loanNumber: string;
  borrowerName: string;
  lender: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  monthlyPayment: number;
  status: string;
  remainingBalance: number;
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
  const [loans, setLoans] = useState<Loan[]>([]);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationEntry[]>([]);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanForm, setLoanForm] = useState({
    borrowerName: "",
    lender: "",
    principalAmount: "",
    interestRate: "",
    termMonths: "",
    startDate: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = () => {
    const mockLoans: Loan[] = [
      {
        id: "1",
        loanNumber: "LOAN-001",
        borrowerName: "ABC Business Solutions",
        lender: "First National Bank",
        principalAmount: 500000,
        interestRate: 11.5,
        termMonths: 60,
        startDate: "2024-01-01",
        monthlyPayment: 10981.89,
        status: "active",
        remainingBalance: 425000,
      },
      {
        id: "2",
        loanNumber: "LOAN-002",
        borrowerName: "Tech Innovations Ltd",
        lender: "ABSA Bank",
        principalAmount: 250000,
        interestRate: 12.25,
        termMonths: 36,
        startDate: "2023-06-01",
        monthlyPayment: 8341.67,
        status: "active",
        remainingBalance: 180000,
      },
    ];
    setLoans(mockLoans);
  };

  const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  const generateAmortizationSchedule = (loan: Loan) => {
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = loan.principalAmount;
    const monthlyRate = loan.interestRate / 100 / 12;
    
    for (let i = 1; i <= loan.termMonths; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = loan.monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      const paymentDate = new Date(loan.startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i - 1);
      
      schedule.push({
        paymentNumber: i,
        paymentDate: paymentDate.toISOString().split('T')[0],
        principalPayment,
        interestPayment,
        totalPayment: loan.monthlyPayment,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }
    
    return schedule;
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(loanForm.principalAmount);
    const rate = parseFloat(loanForm.interestRate);
    const months = parseInt(loanForm.termMonths);
    
    const monthlyPayment = calculateMonthlyPayment(principal, rate, months);
    
    const newLoan: Loan = {
      id: Date.now().toString(),
      loanNumber: `LOAN-${String(loans.length + 1).padStart(3, '0')}`,
      borrowerName: loanForm.borrowerName,
      lender: loanForm.lender,
      principalAmount: principal,
      interestRate: rate,
      termMonths: months,
      startDate: loanForm.startDate,
      monthlyPayment,
      status: "active",
      remainingBalance: principal,
    };
    
    setLoans([...loans, newLoan]);
    setLoanForm({
      borrowerName: "",
      lender: "",
      principalAmount: "",
      interestRate: "",
      termMonths: "",
      startDate: "",
    });
    setShowLoanForm(false);
    
    toast({
      title: "Success",
      description: "Loan added successfully",
    });
  };

  const viewAmortizationSchedule = (loan: Loan) => {
    setSelectedLoan(loan);
    const schedule = generateAmortizationSchedule(loan);
    setAmortizationSchedule(schedule);
  };

  const handlePrint = () => {
    if (selectedLoan) {
      printTable('amortization-table', `Amortization Schedule - ${selectedLoan.loanNumber}`);
    } else {
      printTable('loans-table', 'Loans Summary');
    }
  };

  const handleExportCSV = () => {
    if (selectedLoan && amortizationSchedule.length > 0) {
      const headers = ['Payment #', 'Date', 'Principal', 'Interest', 'Total Payment', 'Balance'];
      exportToCSV(amortizationSchedule, `amortization_${selectedLoan.loanNumber}`, headers);
    } else {
      const headers = ['Loan Number', 'Borrower', 'Lender', 'Principal', 'Rate', 'Monthly Payment', 'Status'];
      exportToCSV(loans, 'loans_summary', headers);
    }
  };

  const handleExportJSON = () => {
    if (selectedLoan && amortizationSchedule.length > 0) {
      exportToJSON(amortizationSchedule, `amortization_${selectedLoan.loanNumber}`);
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
            <Button onClick={() => setShowLoanForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Loan
            </Button>
          </div>
        </div>

        <Tabs defaultValue="loans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="loans">Loan Register</TabsTrigger>
            <TabsTrigger value="amortization">Amortization Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="space-y-4">
            {showLoanForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Loan</CardTitle>
                  <CardDescription>Enter loan details to calculate payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoanSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="borrowerName">Borrower Name</Label>
                      <Input
                        id="borrowerName"
                        value={loanForm.borrowerName}
                        onChange={(e) => setLoanForm({...loanForm, borrowerName: e.target.value})}
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
                      <Label htmlFor="principalAmount">Principal Amount (R)</Label>
                      <Input
                        id="principalAmount"
                        type="number"
                        step="0.01"
                        value={loanForm.principalAmount}
                        onChange={(e) => setLoanForm({...loanForm, principalAmount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        value={loanForm.interestRate}
                        onChange={(e) => setLoanForm({...loanForm, interestRate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="termMonths">Term (Months)</Label>
                      <Input
                        id="termMonths"
                        type="number"
                        value={loanForm.termMonths}
                        onChange={(e) => setLoanForm({...loanForm, termMonths: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={loanForm.startDate}
                        onChange={(e) => setLoanForm({...loanForm, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="submit">Add Loan</Button>
                      <Button type="button" variant="outline" onClick={() => setShowLoanForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Active Loans ({loans.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table id="loans-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan Number</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Lender</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Monthly Payment</TableHead>
                        <TableHead>Remaining Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-mono">{loan.loanNumber}</TableCell>
                          <TableCell className="font-medium">{loan.borrowerName}</TableCell>
                          <TableCell>{loan.lender}</TableCell>
                          <TableCell>R{loan.principalAmount.toLocaleString()}</TableCell>
                          <TableCell>{loan.interestRate}%</TableCell>
                          <TableCell>R{loan.monthlyPayment.toLocaleString()}</TableCell>
                          <TableCell>R{loan.remainingBalance.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={loan.status === "active" ? "default" : "secondary"}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewAmortizationSchedule(loan)}
                            >
                              <Calculator className="h-4 w-4 mr-1" />
                              Schedule
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amortization" className="space-y-4">
            {selectedLoan ? (
              <Card>
                <CardHeader>
                  <CardTitle>Amortization Schedule - {selectedLoan.loanNumber}</CardTitle>
                  <CardDescription>
                    {selectedLoan.borrowerName} | Principal: R{selectedLoan.principalAmount.toLocaleString()} 
                    | Rate: {selectedLoan.interestRate}% | Term: {selectedLoan.termMonths} months
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-96">
                    <Table id="amortization-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Principal</TableHead>
                          <TableHead>Interest</TableHead>
                          <TableHead>Total Payment</TableHead>
                          <TableHead>Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {amortizationSchedule.map((entry) => (
                          <TableRow key={entry.paymentNumber}>
                            <TableCell>{entry.paymentNumber}</TableCell>
                            <TableCell>{entry.paymentDate}</TableCell>
                            <TableCell>R{entry.principalPayment.toFixed(2)}</TableCell>
                            <TableCell>R{entry.interestPayment.toFixed(2)}</TableCell>
                            <TableCell>R{entry.totalPayment.toFixed(2)}</TableCell>
                            <TableCell>R{entry.remainingBalance.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a loan from the register to view its amortization schedule</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default LoanManagement;
