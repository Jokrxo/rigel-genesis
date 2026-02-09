
import { useState } from "react";
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useBudgetData, Budget } from "@/hooks/useBudgetData";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { PermissionGuard } from "@/components/Shared/PermissionGuard";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function BudgetManagement() {
  const { toast } = useToast();
  const { budgets, addBudget, updateBudget, deleteBudget, loading } = useBudgetData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-Q1');
  
  // Edit/Delete State
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State (Shared for Create/Edit)
  const [formData, setFormData] = useState({ 
    category: '', 
    amount: '', 
    period: '2024-Q1', 
    department: '' 
  });

  // Filter budgets based on selected period
  const filteredBudgets = budgets.filter(b => b.period === selectedPeriod);

  const handleOpenAdd = () => {
    setFormData({ category: '', amount: '', period: selectedPeriod, department: '' });
    setEditingBudget(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setFormData({ 
      category: budget.category, 
      amount: budget.amount.toString(), 
      period: budget.period, 
      department: budget.department 
    });
    setEditingBudget(budget);
    setIsEditOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.amount) return;

    try {
        if (editingBudget) {
          await updateBudget(editingBudget.id, {
            category: formData.category,
            amount: Number(formData.amount),
            period: formData.period,
            department: formData.department || 'General'
          });
          setIsEditOpen(false);
          toast({ title: "Budget Updated", description: "Budget updated successfully." });
        } else {
          await addBudget({
            category: formData.category,
            amount: Number(formData.amount),
            period: formData.period,
            department: formData.department || 'General'
          });
          setIsAddOpen(false);
          toast({ title: "Budget Created", description: "Budget created successfully." });
        }
        setEditingBudget(null);
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save budget.",
            variant: "destructive"
        });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      try {
        await deleteBudget(deleteConfirmId);
        toast({ title: "Success", description: "Budget deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete budget", variant: "destructive" });
      } finally {
        setDeleteConfirmId(null);
      }
    }
  };

  const getVarianceColor = (budget: Budget) => {
    const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    if (percentage > 100) return "text-red-600";
    if (percentage > 90) return "text-amber-500";
    return "text-green-600";
  };

  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;

  // Data for charts
  const chartData = filteredBudgets.map(b => ({
    name: b.category,
    Budget: b.amount,
    Actual: b.spent
  }));

  // Group by department for Pie Chart
  const deptData = filteredBudgets.reduce((acc, curr) => {
    const existing = acc.find(d => d.name === curr.department);
    if (existing) {
      existing.value += curr.spent;
    } else {
      acc.push({ name: curr.department, value: curr.spent });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const renderFormContent = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">Category</Label>
        <Input 
          id="category" 
          value={formData.category} 
          onChange={e => setFormData({...formData, category: e.target.value})} 
          className="col-span-3" 
          placeholder="e.g. Marketing" 
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="amount" className="text-right">Amount</Label>
        <Input 
          id="amount" 
          type="number" 
          value={formData.amount} 
          onChange={e => setFormData({...formData, amount: e.target.value})} 
          className="col-span-3" 
          placeholder="0.00" 
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="period" className="text-right">Period</Label>
        <Select value={formData.period} onValueChange={v => setFormData({...formData, period: v})}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-Q1">2024 Q1</SelectItem>
            <SelectItem value="2024-Q2">2024 Q2</SelectItem>
            <SelectItem value="2024-Q3">2024 Q3</SelectItem>
            <SelectItem value="2024-Q4">2024 Q4</SelectItem>
          </SelectContent>
        </Select>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dept" className="text-right">Department</Label>
        <Input 
          id="dept" 
          value={formData.department} 
          onChange={e => setFormData({...formData, department: e.target.value})} 
          className="col-span-3" 
          placeholder="Optional" 
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loading />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
            <p className="text-muted-foreground">Track actual spending against planned budgets.</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-Q1">2024 Q1</SelectItem>
                <SelectItem value="2024-Q2">2024 Q2</SelectItem>
                <SelectItem value="2024-Q3">2024 Q3</SelectItem>
                <SelectItem value="2024-Q4">2024 Q4</SelectItem>
              </SelectContent>
            </Select>
            
            <PermissionGuard action="create" resource="budgets">
              <Button onClick={handleOpenAdd}>
                <Plus className="mr-2 h-4 w-4" /> Set New Budget
              </Button>
            </PermissionGuard>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Budget</DialogTitle>
                    <DialogDescription>Set a spending limit for a specific category and period.</DialogDescription>
                  </DialogHeader>
                  {renderFormContent()}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Budget</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Budget</DialogTitle>
                    <DialogDescription>Update spending limit or category details.</DialogDescription>
                  </DialogHeader>
                  {renderFormContent()}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Update Budget</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isOverBudget && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Budget Overrun Alert</AlertTitle>
            <AlertDescription>
              Total spending (R {totalSpent.toLocaleString()}) has exceeded the total budget (R {totalBudget.toLocaleString()}) for this period.
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Budget ({selectedPeriod})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R {totalBudget.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overallPercentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                R {totalSpent.toLocaleString()}
              </div>
              <Progress value={Math.min(overallPercentage, 100)} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">{overallPercentage.toFixed(1)}% Used</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Forecast (EOP)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R {(totalSpent * 1.1).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Linear Projection (+10%)</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Budget" fill="#8884d8" />
                            <Bar dataKey="Actual" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Spending by Department</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                            <Pie
                                data={deptData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {deptData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        {/* Budgets List Table */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Budgeted</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No budgets set for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBudgets.map((budget) => {
                    const variance = budget.amount - budget.spent;
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.category}</TableCell>
                        <TableCell>{budget.department}</TableCell>
                        <TableCell className="text-right">R {budget.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">R {budget.spent.toLocaleString()}</TableCell>
                        <TableCell className={`text-right ${getVarianceColor(budget)}`}>
                          R {variance.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <PermissionGuard action="edit" resource="budgets">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(budget)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard action="delete" resource="budgets">
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirmId(budget.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Budget?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this budget entry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </MainLayout>
  );
}
