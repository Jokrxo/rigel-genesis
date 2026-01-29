import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const MonthlyReports = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Reports</h1>
          <p className="text-muted-foreground mt-2">
            Monthly breakdown and drill-down analysis of financial reports.
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Compliance Note</AlertTitle>
          <AlertDescription>
            All financial reports strictly follow IFRS and IAS guidelines.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
            <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            <TabsTrigger value="equity">Equity</TabsTrigger>
            <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Financial Dashboard</CardTitle>
                <CardDescription>Key metrics for the current month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Select a specific report tab to view detailed monthly data and drill-downs.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {['balance-sheet', 'income-statement', 'cash-flow', 'equity', 'trial-balance'].map((report) => (
            <TabsContent key={report} value={report}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{report.replace('-', ' ')} (Monthly)</CardTitle>
                  <CardDescription>
                    Monthly view with line item allocation and drill-down capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Monthly data visualization for {report.replace('-', ' ')} will appear here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MonthlyReports;
