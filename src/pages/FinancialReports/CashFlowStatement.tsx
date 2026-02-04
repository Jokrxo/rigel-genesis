import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Download, Calendar as CalendarIcon, Filter } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CashFlowStatement = () => {
  const { getCashFlowStatementData, getBalanceSheetData } = useFinancialData();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Define period (e.g., Year to Date)
  const endDate = date || new Date();
  const startDate = new Date(endDate.getFullYear(), 0, 1); // Jan 1st of current year
  
  const cashFlowData = getCashFlowStatementData(startDate, endDate);
  const balanceSheetData = getBalanceSheetData(endDate);
  
  const closingCash = balanceSheetData.assets.current.cashAndEquivalents;
  const openingCash = closingCash - cashFlowData.netChangeInCash;

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const formatted = `R ${absValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return value < 0 ? `(${formatted})` : formatted;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statement of Cash Flows</h1>
            <p className="text-muted-foreground">
              For the period {format(startDate, "MMM d, yyyy")} to {format(endDate, "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flows from Operating Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Net Profit / (Loss) before Tax</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashFlowData.operatingActivities.netProfit)}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={2} className="font-semibold text-xs uppercase text-muted-foreground">Adjustments for:</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Depreciation and Amortisation</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashFlowData.operatingActivities.adjustments.depreciation)}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={2} className="font-semibold text-xs uppercase text-muted-foreground">Changes in Working Capital:</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">(Increase) / Decrease in Inventories</TableCell>
                  <TableCell className="text-right">{formatCurrency(-cashFlowData.operatingActivities.adjustments.workingCapital.increaseInventory)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">(Increase) / Decrease in Trade Receivables</TableCell>
                  <TableCell className="text-right">{formatCurrency(-cashFlowData.operatingActivities.adjustments.workingCapital.increaseReceivables)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8">Increase / (Decrease) in Trade Payables</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashFlowData.operatingActivities.adjustments.workingCapital.increasePayables)}</TableCell>
                </TableRow>
                <TableRow className="font-bold border-t-2">
                  <TableCell>Net Cash from Operating Activities</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashFlowData.operatingActivities.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flows from Investing Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Purchase of Property, Plant and Equipment</TableCell>
                  <TableCell className="text-right">{formatCurrency(-cashFlowData.investingActivities.purchasePPE)}</TableCell>
                </TableRow>
                <TableRow className="font-bold border-t-2">
                  <TableCell>Net Cash used in Investing Activities</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashFlowData.investingActivities.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flows from Financing Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Proceeds from Long-term Borrowings</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashFlowData.financingActivities.loansReceived)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Repayment of Long-term Borrowings</TableCell>
                  <TableCell className="text-right">{formatCurrency(-cashFlowData.financingActivities.loansRepaid)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Proceeds from Share Capital Issued</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashFlowData.financingActivities.capitalIssued)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dividends Paid</TableCell>
                  <TableCell className="text-right">{formatCurrency(-cashFlowData.financingActivities.dividendsPaid)}</TableCell>
                </TableRow>
                <TableRow className="font-bold border-t-2">
                  <TableCell>Net Cash from Financing Activities</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashFlowData.financingActivities.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 dark:bg-slate-900 border-2">
          <CardContent className="pt-6">
            <Table>
              <TableBody>
                <TableRow className="font-bold text-lg">
                  <TableCell>Net Increase / (Decrease) in Cash and Cash Equivalents</TableCell>
                  <TableCell className="text-right">{formatCurrency(cashFlowData.netChangeInCash)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cash and Cash Equivalents at Beginning of Period</TableCell>
                  <TableCell className="text-right">{formatCurrency(openingCash)}</TableCell>
                </TableRow>
                <TableRow className="font-bold text-lg border-t-2 border-slate-400 dark:border-slate-600">
                  <TableCell>Cash and Cash Equivalents at End of Period</TableCell>
                  <TableCell className="text-right">{formatCurrency(closingCash)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CashFlowStatement;