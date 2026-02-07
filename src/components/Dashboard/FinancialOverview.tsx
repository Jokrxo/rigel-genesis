
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
    totalRevenue: 0,
    changes: {
      assets: 0,
      liabilities: 0,
      equity: 0,
      expenses: 0
    }
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<BreakdownData[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<BreakdownData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const endOfLastYearSamePeriod = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      
      const balanceSheet = getBalanceSheetData(today);
      const previousBalanceSheet = getBalanceSheetData(lastMonthDate);
      
      const incomeStatement = getIncomeStatementData(startOfYear, today);
      const previousIncomeStatement = getIncomeStatementData(startOfLastYear, endOfLastYearSamePeriod);
      
      const currentBankBalance = getBankBalance();

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current === 0 ? 0 : 100;
        return ((current - previous) / previous) * 100;
      };

      setFinancialMetrics({
        totalAssets: balanceSheet.assets.total,
        totalLiabilities: balanceSheet.liabilities.total,
        totalEquity: balanceSheet.equity.total,
        operatingExpenses: incomeStatement.expenses,
        bankBalance: currentBankBalance,
        netProfit: incomeStatement.netProfit,
        totalRevenue: incomeStatement.revenue,
        changes: {
          assets: calculateChange(balanceSheet.assets.total, previousBalanceSheet.assets.total),
          liabilities: calculateChange(balanceSheet.liabilities.total, previousBalanceSheet.liabilities.total),
          equity: calculateChange(balanceSheet.equity.total, previousBalanceSheet.equity.total),
          expenses: calculateChange(incomeStatement.expenses, previousIncomeStatement.expenses)
        }
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
      
      // Use real expense breakdown from financial data
      const expensesData = Object.entries(incomeStatement.expensesByCategory).map(([name, value], index) => {
        const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"];
        return {
          name,
          value,
          color: colors[index % colors.length]
        };
      }).sort((a, b) => b.value - a.value); // Sort by highest expense

      setExpenseBreakdown(expensesData.length > 0 ? expensesData : [
        { name: "No Data", value: 1, color: "#e5e7eb" }
      ]);
      
      // Use real income breakdown
      const incomeData = [
        { name: "Sales Revenue", value: incomeStatement.revenue, color: "#8884d8" },
        { name: "Other Income", value: incomeStatement.otherIncome, color: "#82ca9d" },
      ].filter(item => item.value > 0);

      setIncomeBreakdown(incomeData.length > 0 ? incomeData : [
        { name: "No Data", value: 1, color: "#e5e7eb" }
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
          change={financialMetrics.changes.assets}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Liabilities"
          value={`R ${financialMetrics.totalLiabilities.toLocaleString()}`}
          change={financialMetrics.changes.liabilities}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Equity"
          value={`R ${financialMetrics.totalEquity.toLocaleString()}`}
          change={financialMetrics.changes.equity}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Operating Expenses"
          value={`R ${financialMetrics.operatingExpenses.toLocaleString()}`}
          change={financialMetrics.changes.expenses}
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
