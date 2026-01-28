import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Printer, Download, Calculator, CreditCard, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { printTable, exportToCSV, exportToJSON } from "@/utils/printExportUtils";
import { Chatbot } from "@/components/Shared/Chatbot";
import { ViewEmployeeDialog } from "@/components/EmployeeManagement/ViewEmployeeDialog";
import { EmployeeFormDialog } from "@/components/EmployeeManagement/EmployeeFormDialog";
import { DeleteConfirmationDialog } from "@/components/Shared/DeleteConfirmationDialog";

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

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  
  // Dialog states
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  
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

  useEffect(() => {
    fetchEmployees();
    fetchPayrollEntries();
  }, []);

  const fetchEmployees = () => {
    setEmployees([]);
  };

  const fetchPayrollEntries = () => {
    setPayrollEntries([]);
  };

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

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsViewOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    if (employee) {
      setDeletingEmployee(employee);
      setIsDeleteOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingEmployee) {
      setEmployees(employees.filter(e => e.id !== deletingEmployee.id));
      setIsDeleteOpen(false);
      setDeletingEmployee(null);
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    }
  };

  const handleEmployeeSubmit = (data: any) => {
    if (editingEmployee) {
      // Update existing employee
      const updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...data, grossSalary: Number(data.grossSalary) }
          : emp
      );
      setEmployees(updatedEmployees);
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    } else {
      // Create new employee
      const newEmployee: Employee = {
        id: Date.now().toString(),
        employeeNumber: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
        ...data,
        grossSalary: Number(data.grossSalary),
        status: "active",
      };
      setEmployees([...employees, newEmployee]);
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    }
    
    setShowEmployeeForm(false);
    setEditingEmployee(null);
  };

  const handlePayrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employee = employees.find(emp => emp.id === payrollForm.employeeId);
    if (!employee) return;

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

    const newPayrollEntry: PayrollEntry = {
      id: Date.now().toString(),
      employeeId: payrollForm.employeeId,
      payPeriod: payrollForm.payPeriod,
      grossSalary,
      basicSalary,
      allowances,
      overtimePay,
      payeTax,
      uif,
      medicalAid,
      pensionFund,
      netSalary,
      processedDate: new Date().toISOString().split('T')[0],
    };
    
    setPayrollEntries([...payrollEntries, newPayrollEntry]);
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
  };

  const getFilteredPayroll = () => {
    if (!selectedEmployee) return payrollEntries;
    return payrollEntries.filter(entry => entry.employeeId === selectedEmployee);
  };

  const handlePrint = () => {
    printTable('employees-table', 'Employee Register');
  };

  const handleExportCSV = () => {
    const headers = ['Employee #', 'Name', 'Position', 'Department', 'Gross Salary', 'Status'];
    exportToCSV(employees, 'employees_register', headers);
  };

  const handleExportJSON = () => {
    exportToJSON(employees, 'employees_register');
  };

  // Payroll summary - calculated on filtered payrolls
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">Manage employees and process payroll</p>
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

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees">Employee Register</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Processing</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => {
                setEditingEmployee(null);
                setShowEmployeeForm(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>

            <EmployeeFormDialog
              open={showEmployeeForm}
              onClose={() => {
                setShowEmployeeForm(false);
                setEditingEmployee(null);
              }}
              onSubmit={handleEmployeeSubmit}
              editingEmployee={editingEmployee}
            />

            <ViewEmployeeDialog
              open={isViewOpen}
              onClose={() => setIsViewOpen(false)}
              employee={viewingEmployee}
            />

            <DeleteConfirmationDialog
              open={isDeleteOpen}
              onClose={() => setIsDeleteOpen(false)}
              onConfirm={handleConfirmDelete}
              title="Delete Employee"
              description={`Are you sure you want to delete ${deletingEmployee?.firstName} ${deletingEmployee?.lastName}? This action cannot be undone.`}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Register ({employees.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table id="employees-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee #</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-mono">{employee.employeeNumber}</TableCell>
                          <TableCell className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.hireDate}</TableCell>
                          <TableCell>R{employee.grossSalary.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                              {employee.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewEmployee(employee)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditEmployee(employee)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteEmployee(employee.id)}
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
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <div className="flex justify-between items-center">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={() => setShowPayrollForm(true)}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Process Payroll
                </Button>
                <Button variant="outline" onClick={() => handleExportCSV()}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Payroll CSV
                </Button>
                {/* Pay All Pending Action */}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    toast({
                      title: "Pay All Pending",
                      description: "Payment processing functionality will be available in a future update",
                      variant: "default",
                    });
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay All Pending
                </Button>
              </div>
            </div>

            {/* Payroll Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 my-4">
              <Card>
                <CardHeader><CardTitle>Total Gross Payroll</CardTitle></CardHeader>
                <CardContent className="pt-0 text-2xl font-bold text-blue-700">R{getSummary().totalGross.toLocaleString(undefined, {minimumFractionDigits: 2})}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Total Net Payroll</CardTitle></CardHeader>
                <CardContent className="pt-0 text-2xl font-bold text-green-700">R{getSummary().totalNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Total PAYE (Tax)</CardTitle></CardHeader>
                <CardContent className="pt-0 text-2xl font-bold text-yellow-700">R{getSummary().totalPAYE.toLocaleString(undefined, {minimumFractionDigits: 2})}</CardContent>
              </Card>
            </div>

            {showPayrollForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Process Payroll</CardTitle>
                  <CardDescription>Calculate salary and deductions</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayrollSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payrollEmployee">Employee</Label>
                      <Select onValueChange={(value) => setPayrollForm({...payrollForm, employeeId: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payPeriod">Pay Period (YYYY-MM)</Label>
                      <Input
                        id="payPeriod"
                        value={payrollForm.payPeriod}
                        onChange={(e) => setPayrollForm({...payrollForm, payPeriod: e.target.value})}
                        placeholder="2024-01"
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

            {/* Payroll History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Pay Period</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>PAYE Tax</TableHead>
                        <TableHead>UIF</TableHead>
                        <TableHead>Medical Aid</TableHead>
                        <TableHead>Pension</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Processed</TableHead>
                        {/* Quick Action: Export payslip */}
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredPayroll().map((entry) => {
                        const employee = employees.find(emp => emp.id === entry.employeeId);
                        return (
                          <TableRow key={entry.id}>
                            <TableCell>
                              {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                            </TableCell>
                            <TableCell>{entry.payPeriod}</TableCell>
                            <TableCell>R{entry.grossSalary.toLocaleString()}</TableCell>
                            <TableCell>R{entry.payeTax.toFixed(2)}</TableCell>
                            <TableCell>R{entry.uif.toFixed(2)}</TableCell>
                            <TableCell>R{entry.medicalAid.toFixed(2)}</TableCell>
                            <TableCell>R{entry.pensionFund.toFixed(2)}</TableCell>
                            <TableCell className="font-medium">R{entry.netSalary.toFixed(2)}</TableCell>
                            <TableCell>{entry.processedDate}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  toast({
                                    title: "Payslip Export",
                                    description: `Exporting payslip for ${employee?.firstName} ${employee?.lastName}`,
                                  });
                                }}
                              >
                                Export Payslip
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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

export default EmployeeManagement;
