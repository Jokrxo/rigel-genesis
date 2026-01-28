import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";

const IncomeStatement = () => {
  const { getIncomeStatementData } = useFinancialData();
  const start = new Date(new Date().getFullYear(), 0, 1);
  const end = new Date();
  const incomeData = getIncomeStatementData(start, end);

  // Map hook data to component structure
  // Negate expenses for display logic if they are positive in the hook (assuming hook returns positive values for expenses)
  const data = {
    revenue: incomeData.revenue,
    costOfSales: -incomeData.costOfSales, // Display as deduction
    otherIncome: incomeData.otherIncome,
    expenses: {
      distribution: 0, // TODO: map from category
      admin: -incomeData.expenses, // Lump sum, display as deduction
      other: 0,
      finance: 0
    },
    incomeTax: -incomeData.taxExpenses
  };
  
  // Recalculate based on real data
  const grossProfit = data.revenue + data.costOfSales;
  const operatingProfit = grossProfit + data.otherIncome + data.expenses.distribution + data.expenses.admin + data.expenses.other;
  const profitBeforeTax = operatingProfit + data.expenses.finance;
  const profitForYear = profitBeforeTax + data.incomeTax;

  const formatCurrency = (value: number) => {
    return `R ${Math.abs(value).toLocaleString()}`;
  };

  const renderRow = (label: string, value: number, isTotal = false, isNegative = false) => (
    <TableRow className={isTotal ? "font-bold" : ""}>
      <TableCell className={isTotal ? "" : "pl-8"}>{label}</TableCell>
      <TableCell className="text-right">
        {value < 0 || isNegative ? `(${formatCurrency(value)})` : formatCurrency(value)}
      </TableCell>
    </TableRow>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statement of Profit or Loss and Other Comprehensive Income</h1>
            <p className="text-muted-foreground">For the year ended {new Date().getFullYear()}</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableBody>
                {renderRow("Revenue", data.revenue, true)}
                {renderRow("Cost of sales", data.costOfSales)}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Gross profit</TableCell>
                  <TableCell className="text-right">{formatCurrency(grossProfit)}</TableCell>
                </TableRow>
                
                {renderRow("Other income", data.otherIncome)}
                
                {/* Dynamically render expenses if possible, or stick to structure */}
                {Object.keys(incomeData.expensesByCategory).length > 0 ? (
                    Object.entries(incomeData.expensesByCategory).map(([cat, amount]) => 
                        renderRow(cat, -amount)
                    )
                ) : (
                    <>
                        {renderRow("Distribution costs", data.expenses.distribution)}
                        {renderRow("Administrative expenses", data.expenses.admin)}
                        {renderRow("Other expenses", data.expenses.other)}
                    </>
                )}
                
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Operating profit</TableCell>
                  <TableCell className="text-right">{formatCurrency(operatingProfit)}</TableCell>
                </TableRow>

                {renderRow("Finance costs", data.expenses.finance)}
                
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Profit before tax</TableCell>
                  <TableCell className="text-right">{formatCurrency(profitBeforeTax)}</TableCell>
                </TableRow>

                {renderRow("Income tax expense", data.incomeTax)}
                
                <TableRow className="bg-primary/10 font-bold text-lg">
                  <TableCell>Profit for the year</TableCell>
                  <TableCell className="text-right">{formatCurrency(profitForYear)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default IncomeStatement;
