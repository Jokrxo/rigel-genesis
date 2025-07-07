
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, BarChart3, Download, Printer } from "lucide-react";
import { useState } from "react";
import StatCard from "./FinancialOverview/StatCard";
import RevenueExpensesChart from "./FinancialOverview/RevenueExpensesChart";
import ExpenseBreakdownChart from "./FinancialOverview/ExpenseBreakdownChart";
import IncomeBreakdownChart from "./FinancialOverview/IncomeBreakdownChart";
import { ExportControls } from "./ExportControls";
import { formatCurrency } from "@/utils/exportUtils";

const monthlyData = [
  { month: "Jan", income: 15000, expenses: 12000 },
  { month: "Feb", income: 16500, expenses: 12500 },
  { month: "Mar", income: 14000, expenses: 13000 },
  { month: "Apr", income: 18000, expenses: 12800 },
  { month: "May", income: 19500, expenses: 13500 },
  { month: "Jun", income: 21000, expenses: 14000 },
];

const expenseBreakdown = [
  { name: "Rent", value: 3500, color: "#0088FE" },
  { name: "Salaries", value: 5500, color: "#00C49F" },
  { name: "Utilities", value: 1200, color: "#FFBB28" },
  { name: "Marketing", value: 2300, color: "#FF8042" },
  { name: "Supplies", value: 1800, color: "#8884d8" },
];

const incomeBreakdown = [
  { name: "Product Sales", value: 12000, color: "#8884d8" },
  { name: "Services", value: 6000, color: "#82ca9d" },
  { name: "Consulting", value: 3000, color: "#ffc658" },
];

export const FinancialOverview = () => {
  const [chartType] = useState<'line' | 'bar'>('line');
  
  const handlePrintReport = () => {
    window.print();
  };
  
  const handleDownloadCSV = () => {
    const headers = ["Month", "Income", "Expenses"];
    const csvRows = [headers];
    monthlyData.forEach(item => {
      csvRows.push([item.month, item.income.toString(), item.expenses.toString()]);
    });
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "financial_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare data for export
  const exportData = {
    summary: {
      totalRevenue: 124500,
      totalExpenses: 78300,
      netProfit: 46200,
      taxLiability: 12936
    },
    monthlyData,
    expenseBreakdown,
    incomeBreakdown
  };

  const csvData = {
    headers: ["Month", "Income", "Expenses", "Net"],
    rows: monthlyData.map(item => [
      item.month,
      item.income,
      item.expenses,
      item.income - item.expenses
    ]),
    filename: "financial_overview.csv"
  };

  return (
    <div id="financial-overview" className="space-y-6 print:space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <h2 className="text-2xl font-bold">Financial Overview</h2>
        <div className="flex gap-2">
          <ExportControls
            data={exportData}
            filename="financial_overview"
            csvData={csvData}
            elementId="financial-overview"
          />
          <Button size="sm" variant="outline" onClick={handleDownloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button size="sm" onClick={handlePrintReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="R 124,500.00"
          change={12.5}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Expenses"
          value="R 78,300.00"
          change={5.2}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Net Profit"
          value="R 46,200.00"
          change={8.7}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Tax Liability"
          value="R 12,936.00"
          change={-3.1}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <RevenueExpensesChart monthlyData={monthlyData} />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <ExpenseBreakdownChart expenseBreakdown={expenseBreakdown} />
        <IncomeBreakdownChart incomeBreakdown={incomeBreakdown} />
      </div>
    </div>
  );
};
