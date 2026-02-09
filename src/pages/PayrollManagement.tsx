import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Plus, Printer, Download, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";
import { Chatbot } from "@/components/Shared/Chatbot";
import { supabase } from "@/integrations/supabase/client";
import { auditLogger } from "@/lib/audit-logger";
import { PermissionGuard } from "@/components/Shared/PermissionGuard";

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  grossSalary: number;
  taxNumber: string;
  bankAccount: string;
  status: string;
}

interface PayrollEntry {
  id: string;
  employeeId: string;
  payPeriod: string;
  grossSalary: number;
  basicSalary: number;
  allowances: number;
  overtimePay: number;
  payeTax: number;
  uif: number;
  medicalAid: number;
  pensionFund: number;
  netSalary: number;
  processedDate: string;
}

interface PayslipData {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriod: string;
  basicSalary: number;
  allowances: number;
  overtimePay: number;
  grossSalary: number;
  payeTax: number;
  uif: number;
  medicalAid: number;
  pensionFund: number;
  totalDeductions: number;
  netSalary: number;
  processedDate: string;
}

const PayrollManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [payslips, setPayslips] = useState<PayslipData[]>([]);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [payrollForm, setPayrollForm] = useState({
    employeeId: "",
    payPeriod: "",
    basicSalary: "",
    allowances: "",
    overtimePay: "",
    medicalAid: "",
    pensionFund: "",
  });
  const { toast } = useToast();

  const getCompanyId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();
      
    return data?.company_id;
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const companyId = await getCompanyId();
      if (!companyId) return;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedEmployees: Employee[] = (data || []).map(emp => ({
        id: emp.id,
        employeeNumber: emp.employee_number || `EMP-${emp.id.substring(0, 4)}`,
        firstName: emp.first_name,
        lastName: emp.last_name,
        email: emp.email || '',
        phone: emp.phone || '',
        position: emp.position || '',
        department: emp.department || '',
        hireDate: emp.hire_date || '',
        grossSalary: Number(emp.salary || 0),
        taxNumber: emp.tax_number || '',
        bankAccount: emp.bank_account_number || '',
        status: emp.is_active ? 'active' : 'inactive'
      }));

      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchPayrollEntries = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const companyId = await getCompanyId();
      if (!companyId) return;

      const { data, error } = await supabase
        .from('payroll_entries')
        .select('*')
        .eq('company_id', companyId)
        .order('processed_date', { ascending: false });

      if (error) throw error;

      const mappedEntries: PayrollEntry[] = (data || []).map(entry => ({
        id: entry.id,
        employeeId: entry.employee_id,
        payPeriod: entry.pay_period,
        grossSalary: Number(entry.gross_salary),
        basicSalary: Number(entry.basic_salary),
        allowances: Number(entry.allowances),
        overtimePay: Number(entry.overtime_pay),
        payeTax: Number(entry.paye_tax),
        uif: Number(entry.uif),
        medicalAid: Number(entry.medical_aid),
        pensionFund: Number(entry.pension_fund),
        netSalary: Number(entry.net_salary),
        processedDate: entry.processed_date
      }));

      setPayrollEntries(mappedEntries);
    } catch (error) {
      console.error('Error fetching payroll:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payroll entries",
        variant: "destructive",
      });
    }
  }, [toast]);

  const generatePayslips = useCallback(() => {
    // Generate payslips from payroll entries
    const generatedPayslips = payrollEntries.map(entry => {
      const employee = employees.find(e => e.id === entry.employeeId);
      const totalDeductions = entry.payeTax + entry.uif + entry.medicalAid + entry.pensionFund;
      
      return {
        id: entry.id,
        employeeId: entry.employeeId,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
        payPeriod: entry.payPeriod,
        basicSalary: entry.basicSalary,
        allowances: entry.allowances,
        overtimePay: entry.overtimePay,
        grossSalary: entry.grossSalary,
        payeTax: entry.payeTax,
        uif: entry.uif,
        medicalAid: entry.medicalAid,
        pensionFund: entry.pensionFund,
        totalDeductions,
        netSalary: entry.netSalary,
        processedDate: entry.processedDate
      };
    });
    setPayslips(generatedPayslips);
  }, [payrollEntries, employees]);

  useEffect(() => {
    fetchEmployees();
    fetchPayrollEntries();
    generatePayslips();
  }, [fetchEmployees, fetchPayrollEntries, generatePayslips]);

  const calculateSouthAfricanTax = (grossSalary: number) => {
    // Simplified PAYE tax calculation for South Africa (2024 tax year)
    const annualSalary = grossSalary * 12;
    let tax = 0;
    
    if (annualSalary <= 237100) {
      tax = annualSalary * 0.18;
    } else if (annualSalary <= 370500) {
      tax = 42678 + (annualSalary - 237100) * 0.26;
    } else if (annualSalary <= 512800) {
      tax = 77362 + (annualSalary - 370500) * 0.31;
    } else if (annualSalary <= 673000) {
      tax = 121475 + (annualSalary - 512800) * 0.36;
    } else if (annualSalary <= 857900) {
      tax = 179147 + (annualSalary - 673000) * 0.39;
    } else {
      tax = 251258 + (annualSalary - 857900) * 0.41;
    }
    
    // Apply primary rebate
    tax = Math.max(0, tax - 17235);
    
    return tax / 12; // Monthly tax
  };

  const calculateUIF = (grossSalary: number) => {
    // UIF is 1% of gross salary, capped at R177.12 per month (2024)
    return Math.min(grossSalary * 0.01, 177.12);
  };

  const handlePayrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employee = employees.find(emp => emp.id === payrollForm.employeeId);
      if (!employee) return;

      const companyId = await getCompanyId();
      if (!companyId) throw new Error("Company not found");

      const basicSalary = parseFloat(payrollForm.basicSalary);
      const allowances = parseFloat(payrollForm.allowances) || 0;
      const overtimePay = parseFloat(payrollForm.overtimePay) || 0;
      const grossSalary = basicSalary + allowances + overtimePay;
      
      const payeTax = calculateSouthAfricanTax(grossSalary);
      const uif = calculateUIF(grossSalary);
      const medicalAid = parseFloat(payrollForm.medicalAid) || 0;
      const pensionFund = parseFloat(payrollForm.pensionFund) || 0;
      
      const totalDeductions = payeTax + uif + medicalAid + pensionFund;
      const netSalary = grossSalary - totalDeductions;

      const payrollData = {
        company_id: companyId,
        employee_id: payrollForm.employeeId,
        pay_period: payrollForm.payPeriod,
        gross_salary: grossSalary,
        basic_salary: basicSalary,
        allowances: allowances,
        overtime_pay: overtimePay,
        paye_tax: payeTax,
        uif: uif,
        medical_aid: medicalAid,
        pension_fund: pensionFund,
        net_salary: netSalary,
        processed_date: new Date().toISOString().split('T')[0]
      };

      const { data: newPayroll, error } = await supabase
        .from('payroll_entries')
        .insert([payrollData])
        .select()
        .single();

      if (error) throw error;

      if (newPayroll) {
        await auditLogger.log({
          action: 'PROCESS_PAYROLL',
          entityType: 'payroll_entry',
          entityId: newPayroll.id,
          details: { 
            employeeId: payrollForm.employeeId, 
            payPeriod: payrollForm.payPeriod,
            netSalary: netSalary
          }
        });
      }
      
      fetchPayrollEntries();
      setPayrollForm({
        employeeId: "",
        payPeriod: "",
        basicSalary: "",
        allowances: "",
        overtimePay: "",
        medicalAid: "",
        pensionFund: "",
      });
      setShowPayrollForm(false);
      
      toast({
        title: "Success",
        description: "Payroll processed successfully",
      });
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast({
        title: "Error",
        description: "Failed to process payroll",
        variant: "destructive",
      });
    }
  };

  const getFilteredPayroll = () => {
    if (!selectedEmployee || selectedEmployee === "all") return payrollEntries;
    return payrollEntries.filter(entry => entry.employeeId === selectedEmployee);
  };

  const handlePrint = () => {
    printTable('payroll-table', 'Payroll Register');
  };

  const handleExportCSV = () => {
    const headers = ['Employee', 'Pay Period', 'Gross Salary', 'Net Salary', 'PAYE Tax', 'UIF'];
    exportToCSV(getFilteredPayroll(), 'payroll_register', headers);
  };

  const handleExportJSON = () => {
    exportToJSON(getFilteredPayroll(), 'payroll_register');
  };

  const getSummary = () => {
    const payroll = getFilteredPayroll();
    return {
      totalGross: payroll.reduce((sum, e) => sum + e.grossSalary, 0),
      totalNet: payroll.reduce((sum, e) => sum + e.netSalary, 0),
      totalPAYE: payroll.reduce((sum, e) => sum + e.payeTax, 0),
      totalUIF: payroll.reduce((sum, e) => sum + e.uif, 0),
      totalEntries: payroll.length,
    };
  };

  const summary = getSummary();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">Process employee salaries and manage payroll</p>
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
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalEntries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{summary.totalGross.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Net</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{summary.totalNet.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PAYE</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{summary.totalPAYE.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total UIF</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{summary.totalUIF.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payroll" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payroll">Payroll Processing</TabsTrigger>
            <TabsTrigger value="payslips">Payslips</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="payroll" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <Label htmlFor="employee-filter">Filter by Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All employees</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <PermissionGuard action="create" resource="payroll">
                <Button onClick={() => setShowPayrollForm(true)} className="self-end">
                  <Plus className="mr-2 h-4 w-4" />
                  Process Payroll
                </Button>
              </PermissionGuard>
            </div>

            {showPayrollForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Process Payroll</CardTitle>
                  <CardDescription>Calculate salary for an employee</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayrollSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee</Label>
                      <Select value={payrollForm.employeeId} onValueChange={(value) => setPayrollForm({...payrollForm, employeeId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.firstName} {employee.lastName} - {employee.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payPeriod">Pay Period</Label>
                      <Input
                        id="payPeriod"
                        type="month"
                        value={payrollForm.payPeriod}
                        onChange={(e) => setPayrollForm({...payrollForm, payPeriod: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="basicSalary">Basic Salary (R)</Label>
                      <Input
                        id="basicSalary"
                        type="number"
                        step="0.01"
                        value={payrollForm.basicSalary}
                        onChange={(e) => setPayrollForm({...payrollForm, basicSalary: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allowances">Allowances (R)</Label>
                      <Input
                        id="allowances"
                        type="number"
                        step="0.01"
                        value={payrollForm.allowances}
                        onChange={(e) => setPayrollForm({...payrollForm, allowances: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overtimePay">Overtime Pay (R)</Label>
                      <Input
                        id="overtimePay"
                        type="number"
                        step="0.01"
                        value={payrollForm.overtimePay}
                        onChange={(e) => setPayrollForm({...payrollForm, overtimePay: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicalAid">Medical Aid (R)</Label>
                      <Input
                        id="medicalAid"
                        type="number"
                        step="0.01"
                        value={payrollForm.medicalAid}
                        onChange={(e) => setPayrollForm({...payrollForm, medicalAid: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pensionFund">Pension Fund (R)</Label>
                      <Input
                        id="pensionFund"
                        type="number"
                        step="0.01"
                        value={payrollForm.pensionFund}
                        onChange={(e) => setPayrollForm({...payrollForm, pensionFund: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="submit">Process Payroll</Button>
                      <Button type="button" variant="outline" onClick={() => setShowPayrollForm(false)}>
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
                  <Calculator className="h-5 w-5" />
                  Payroll Entries ({getFilteredPayroll().length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table id="payroll-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Pay Period</TableHead>
                        <TableHead>Basic Salary</TableHead>
                        <TableHead>Allowances</TableHead>
                        <TableHead>Overtime</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>PAYE Tax</TableHead>
                        <TableHead>UIF</TableHead>
                        <TableHead>Medical Aid</TableHead>
                        <TableHead>Pension</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Date Processed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredPayroll().map((entry) => {
                        const employee = employees.find(emp => emp.id === entry.employeeId);
                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">
                              {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                            </TableCell>
                            <TableCell>{entry.payPeriod}</TableCell>
                            <TableCell>R{entry.basicSalary.toLocaleString()}</TableCell>
                            <TableCell>R{entry.allowances.toLocaleString()}</TableCell>
                            <TableCell>R{entry.overtimePay.toLocaleString()}</TableCell>
                            <TableCell>R{entry.grossSalary.toLocaleString()}</TableCell>
                            <TableCell>R{entry.payeTax.toLocaleString()}</TableCell>
                            <TableCell>R{entry.uif.toLocaleString()}</TableCell>
                            <TableCell>R{entry.medicalAid.toLocaleString()}</TableCell>
                            <TableCell>R{entry.pensionFund.toLocaleString()}</TableCell>
                            <TableCell className="font-bold">R{entry.netSalary.toLocaleString()}</TableCell>
                            <TableCell>{entry.processedDate}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payslips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Payslips</CardTitle>
                <CardDescription>Generate and view employee payslips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Payslip generation feature will be implemented here</p>
                  <p className="text-sm text-muted-foreground mt-2">This will include PDF generation and email distribution</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Reports</CardTitle>
                <CardDescription>Generate various payroll reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Payroll reporting features will be implemented here</p>
                  <p className="text-sm text-muted-foreground mt-2">Including monthly summaries, tax reports, and compliance reports</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Chatbot />
    </MainLayout>
  );
};

export default PayrollManagement;