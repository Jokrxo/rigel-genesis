import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";

const BalanceSheet = () => {
  const { getBalanceSheetData } = useFinancialData();
  const balanceData = getBalanceSheetData(new Date());

  // Map to component state
  const data = {
    assets: {
      nonCurrent: [
        { name: "Property, Plant and Equipment", value: balanceData.assets.nonCurrent.propertyPlantEquipment },
        { name: "Intangible Assets", value: balanceData.assets.nonCurrent.intangibleAssets },
        { name: "Investments", value: balanceData.assets.nonCurrent.investments },
      ],
      current: [
        { name: "Inventories", value: balanceData.assets.current.inventories },
        { name: "Trade and Other Receivables", value: balanceData.assets.current.tradeReceivables },
        { name: "Cash and Cash Equivalents", value: balanceData.assets.current.cashAndEquivalents },
      ]
    },
    equity: [
      { name: "Share Capital", value: balanceData.equity.shareCapital },
      { name: "Retained Earnings", value: balanceData.equity.retainedEarnings },
      { name: "Drawings", value: balanceData.equity.drawings },
    ],
    liabilities: {
      nonCurrent: [
        { name: "Long-term Borrowings", value: balanceData.liabilities.nonCurrent.longTermBorrowings },
        { name: "Deferred Tax Liabilities", value: 0 },
      ],
      current: [
        { name: "Trade and Other Payables", value: balanceData.liabilities.current.tradePayables },
        { name: "Short-term Borrowings", value: balanceData.liabilities.current.shortTermBorrowings },
        { name: "Current Tax Liabilities", value: balanceData.liabilities.current.taxLiabilities },
      ]
    }
  };

  const calculateTotal = (items: { value: number }[]) => items.reduce((sum, item) => sum + item.value, 0);

  const totalNonCurrentAssets = balanceData.assets.nonCurrent.total;
  const totalCurrentAssets = balanceData.assets.current.total;
  const totalAssets = balanceData.assets.total;

  const totalEquity = balanceData.equity.total;
  const totalNonCurrentLiabilities = balanceData.liabilities.nonCurrent.total;
  const totalCurrentLiabilities = balanceData.liabilities.current.total;
  const totalEquityAndLiabilities = totalEquity + totalNonCurrentLiabilities + totalCurrentLiabilities;

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const formatted = `R ${absValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return value < 0 ? `(${formatted})` : formatted;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statement of Financial Position</h1>
            <p className="text-muted-foreground">As at {new Date().toLocaleDateString()}</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={2}>Non-current assets</TableCell>
                </TableRow>
                {data.assets.nonCurrent.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total non-current assets</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalNonCurrentAssets)}</TableCell>
                </TableRow>

                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={2}>Current assets</TableCell>
                </TableRow>
                {data.assets.current.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total current assets</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCurrentAssets)}</TableCell>
                </TableRow>

                <TableRow className="bg-primary/10 text-lg font-bold">
                  <TableCell>Total Assets</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalAssets)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equity and Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={2}>Equity</TableCell>
                </TableRow>
                {data.equity.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total equity</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalEquity)}</TableCell>
                </TableRow>

                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={2}>Non-current liabilities</TableCell>
                </TableRow>
                {data.liabilities.nonCurrent.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total non-current liabilities</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalNonCurrentLiabilities)}</TableCell>
                </TableRow>

                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={2}>Current liabilities</TableCell>
                </TableRow>
                {data.liabilities.current.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total current liabilities</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCurrentLiabilities)}</TableCell>
                </TableRow>

                <TableRow className="bg-primary/10 text-lg font-bold">
                  <TableCell>Total Equity and Liabilities</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalEquityAndLiabilities)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BalanceSheet;
