
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, BarChart3, Download, Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./FinancialOverview/StatCard";
import RevenueExpensesChart from "./FinancialOverview/RevenueExpensesChart";
import ExpenseBreakdownChart from "./FinancialOverview/ExpenseBreakdownChart";
import IncomeBreakdownChart from "./FinancialOverview/IncomeBreakdownChart";
import { ExportControls } from "./ExportControls";
import { formatCurrency } from "@/utils/exportUtils";
import { useFinancialData } from "@/hooks/useFinancialData";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface BreakdownData {
  name: string;
  value: number;
  color: string;
}

export const FinancialOverview = () => {
  const [chartType] = useState<'line' | 'bar'>('line');
  const { getBalanceSheetData, getIncomeStatementData, getBankBalance } = useFinancialData();
  const [financialMetrics, setFinancialMetrics] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    operatingExpenses: 0,
    bankBalance: 0,
    netProfit: 0,
    totalRevenue: 0
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<BreakdownData[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<BreakdownData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      
      const balanceSheet = getBalanceSheetData(today);
      const incomeStatement = getIncomeStatementData(startOfYear, today);
      const currentBankBalance = getBankBalance();

      setFinancialMetrics({
        totalAssets: balanceSheet.assets.total,
        totalLiabilities: balanceSheet.liabilities.total,
        totalEquity: balanceSheet.equity.total,
        operatingExpenses: incomeStatement.expenses,
        bankBalance: currentBankBalance,
        netProfit: incomeStatement.netProfit,
        totalRevenue: incomeStatement.revenue
      });

      // Generate Monthly Data (Last 6 months)
      const months = [];
      for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthName = d.toLocaleString('default', { month: 'short' });
          const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
          const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
          
          const monthData = getIncomeStatementData(startOfMonth, endOfMonth);
          months.push({
              month: monthName,
              income: monthData.revenue,
              expenses: monthData.expenses
          });
      }
      setMonthlyData(months);
      
      // Placeholder breakdown data (In a real app, this would be fetched from GL categories)
      setExpenseBreakdown([
          { name: "Rent", value: incomeStatement.expenses * 0.3, color: "#0088FE" },
          { name: "Salaries", value: incomeStatement.expenses * 0.4, color: "#00C49F" },
          { name: "Utilities", value: incomeStatement.expenses * 0.1, color: "#FFBB28" },
          { name: "Marketing", value: incomeStatement.expenses * 0.1, color: "#FF8042" },
          { name: "Other", value: incomeStatement.expenses * 0.1, color: "#8884d8" },
      ]);
      
      setIncomeBreakdown([
          { name: "Sales", value: incomeStatement.revenue * 0.8, color: "#8884d8" },
          { name: "Services", value: incomeStatement.revenue * 0.2, color: "#82ca9d" },
      ]);
    };

    fetchData();
  }, [getBalanceSheetData, getIncomeStatementData, getBankBalance]);

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
      totalRevenue: financialMetrics.totalRevenue,
      totalExpenses: financialMetrics.operatingExpenses,
      netProfit: financialMetrics.netProfit,
      taxLiability: 0 // Placeholder
    },
    monthlyData,
    expenseBreakdown,
    incomeBreakdown
  };

  const csvData = {
    headers: ["Metric", "Value"],
    rows: [
      ["Total Assets", financialMetrics.totalAssets],
      ["Total Liabilities", financialMetrics.totalLiabilities],
      ["Total Equity", financialMetrics.totalEquity],
      ["Operating Expenses", financialMetrics.operatingExpenses],
      ["Net Profit", financialMetrics.netProfit]
    ],
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
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Assets"
          value={`R ${financialMetrics.totalAssets.toLocaleString()}`}
          change={0}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Liabilities"
          value={`R ${financialMetrics.totalLiabilities.toLocaleString()}`}
          change={0}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Equity"
          value={`R ${financialMetrics.totalEquity.toLocaleString()}`}
          change={0}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Operating Expenses"
          value={`R ${financialMetrics.operatingExpenses.toLocaleString()}`}
          change={0}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
         <StatCard
          title="Bank Balance"
          value={`R ${financialMetrics.bankBalance.toLocaleString()}`}
          change={0}
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
