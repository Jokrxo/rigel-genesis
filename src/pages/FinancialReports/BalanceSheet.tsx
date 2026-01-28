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
        { name: "Property, Plant and Equipment", value: balanceData.assets.nonCurrentAssets },
        { name: "Intangible Assets", value: 0 },
        { name: "Goodwill", value: 0 },
      ],
      current: [
        { name: "Inventories", value: 0 }, // Needs inventory module integration
        { name: "Trade and Other Receivables", value: 0 }, // Needs invoicing integration
        { name: "Cash and Cash Equivalents", value: balanceData.assets.cash },
      ]
    },
    equity: [
      { name: "Share Capital", value: balanceData.equity.capital },
      { name: "Retained Earnings", value: balanceData.equity.retainedEarnings },
      { name: "Drawings", value: -balanceData.equity.drawings }, // Show as deduction
    ],
    liabilities: {
      nonCurrent: [
        { name: "Long-term Borrowings", value: balanceData.liabilities.nonCurrent },
        { name: "Deferred Tax Liabilities", value: 0 },
      ],
      current: [
        { name: "Trade and Other Payables", value: 0 },
        { name: "Short-term Borrowings", value: balanceData.liabilities.current },
        { name: "Current Tax Liabilities", value: 0 },
      ]
    }
  };

  const calculateTotal = (items: { value: number }[]) => items.reduce((sum, item) => sum + item.value, 0);

  const totalNonCurrentAssets = calculateTotal(data.assets.nonCurrent);
  const totalCurrentAssets = calculateTotal(data.assets.current);
  const totalAssets = totalNonCurrentAssets + totalCurrentAssets;

  const totalEquity = calculateTotal(data.equity);
  const totalNonCurrentLiabilities = calculateTotal(data.liabilities.nonCurrent);
  const totalCurrentLiabilities = calculateTotal(data.liabilities.current);
  const totalEquityAndLiabilities = totalEquity + totalNonCurrentLiabilities + totalCurrentLiabilities;


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
                    <TableCell className="text-right">R {item.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total non-current assets</TableCell>
                  <TableCell className="text-right">R {totalNonCurrentAssets.toLocaleString()}</TableCell>
                </TableRow>

                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={2}>Current assets</TableCell>
                </TableRow>
                {data.assets.current.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.name}</TableCell>
                    <TableCell className="text-right">R {item.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total current assets</TableCell>
                  <TableCell className="text-right">R {totalCurrentAssets.toLocaleString()}</TableCell>
                </TableRow>

                <TableRow className="bg-primary/10 text-lg font-bold">
                  <TableCell>Total Assets</TableCell>
                  <TableCell className="text-right">R {totalAssets.toLocaleString()}</TableCell>
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
                    <TableCell className="text-right">R {item.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total equity</TableCell>
                  <TableCell className="text-right">R {totalEquity.toLocaleString()}</TableCell>
                </TableRow>

                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={2}>Non-current liabilities</TableCell>
                </TableRow>
                {data.liabilities.nonCurrent.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.name}</TableCell>
                    <TableCell className="text-right">R {item.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total non-current liabilities</TableCell>
                  <TableCell className="text-right">R {totalNonCurrentLiabilities.toLocaleString()}</TableCell>
                </TableRow>

                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold" colSpan={2}>Current liabilities</TableCell>
                </TableRow>
                {data.liabilities.current.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-8">{item.name}</TableCell>
                    <TableCell className="text-right">R {item.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell className="pl-8">Total current liabilities</TableCell>
                  <TableCell className="text-right">R {totalCurrentLiabilities.toLocaleString()}</TableCell>
                </TableRow>

                <TableRow className="bg-primary/10 text-lg font-bold">
                  <TableCell>Total Equity and Liabilities</TableCell>
                  <TableCell className="text-right">R {totalEquityAndLiabilities.toLocaleString()}</TableCell>
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
