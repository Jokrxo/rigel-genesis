
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ExportControls } from "@/components/Dashboard/ExportControls";

// Report type definitions
interface BaseReport {
  reportType: string;
  generatedDate: string;
  dateFrom?: string;
  dateTo?: string;
}

interface FinancialOverviewReport extends BaseReport {
  reportType: 'financial-overview';
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossProfitMargin: number;
  categories: { name: string; amount: number }[];
}

interface TaxSummaryReport extends BaseReport {
  reportType: 'tax-summary';
  totalVAT: number;
  incomeTax: number;
  provisionalTax: number;
  payeDeducted: number;
  totalTaxLiability: number;
}

interface AssetRegisterReport extends BaseReport {
  reportType: 'asset-register';
  assets: { name: string; cost: number; depreciation: number; bookValue: number }[];
}

interface DefaultReport extends BaseReport {
  message: string;
  data: unknown[];
}

type GeneratedReport = FinancialOverviewReport | TaxSummaryReport | AssetRegisterReport | DefaultReport | null;

const ReportsGenerator = () => {
  const [reportType, setReportType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport>(null);

  const reportTypes = [
    { value: 'financial-overview', label: 'Financial Overview Report' },
    { value: 'income-statement', label: 'Income Statement' },
    { value: 'balance-sheet', label: 'Balance Sheet' },
    { value: 'cash-flow', label: 'Cash Flow Statement' },
    { value: 'tax-summary', label: 'Tax Summary Report' },
    { value: 'asset-register', label: 'Asset Register' },
    { value: 'inventory-report', label: 'Inventory Report' },
    { value: 'customer-analysis', label: 'Customer Analysis' },
    { value: 'expense-analysis', label: 'Expense Analysis' },
    { value: 'vat-return', label: 'VAT Return Report' },
  ];

  const generateReport = () => {
    if (!reportType) {
      alert('Please select a report type');
      return;
    }

    // Generate sample data based on report type
    const sampleData = generateSampleData(reportType);
    setGeneratedReport(sampleData);
  };

  const generateSampleData = (type: string): GeneratedReport => {
    const baseData: BaseReport = {
      reportType: type,
      generatedDate: new Date().toISOString(),
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    };

    switch (type) {
      case 'financial-overview':
        return {
          ...baseData,
          reportType: 'financial-overview',
          totalRevenue: 1250000,
          totalExpenses: 890000,
          netProfit: 360000,
          grossProfitMargin: 28.8,
          categories: [
            { name: 'Sales Revenue', amount: 1250000 },
            { name: 'Cost of Sales', amount: 890000 },
            { name: 'Operating Expenses', amount: 180000 },
            { name: 'Administrative Expenses', amount: 120000 },
          ]
        };
      case 'tax-summary':
        return {
          ...baseData,
          reportType: 'tax-summary',
          totalVAT: 187500,
          incomeTax: 144000,
          provisionalTax: 72000,
          payeDeducted: 84000,
          totalTaxLiability: 243500,
        };
      case 'asset-register':
        return {
          ...baseData,
          reportType: 'asset-register',
          assets: [
            { name: 'Office Building', cost: 2500000, depreciation: 125000, bookValue: 2375000 },
            { name: 'Vehicle Fleet', cost: 850000, depreciation: 170000, bookValue: 680000 },
            { name: 'IT Equipment', cost: 120000, depreciation: 60000, bookValue: 60000 },
            { name: 'Office Furniture', cost: 85000, depreciation: 25500, bookValue: 59500 },
          ]
        };
      default:
        return {
          ...baseData,
          message: 'Report generated successfully',
          data: []
        };
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl">Generate Reports</CardTitle>
          <CardDescription className="text-base">
            Create comprehensive financial and business reports with export capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="reportType" className="text-base font-medium">Report Type</Label>
              <Select onValueChange={setReportType}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.value} value={report.value}>
                      {report.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Date Range</Label>
              <div className="flex space-x-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal h-12",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal h-12",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Button onClick={generateReport} className="w-full h-12 text-base">
            <FileText className="mr-2 h-5 w-5" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {generatedReport && (
        <Card id="generated-report" className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-2">
              <CardTitle className="text-xl">
                {reportTypes.find(r => r.value === generatedReport.reportType)?.label}
              </CardTitle>
              <CardDescription className="text-base">
                Generated on {format(new Date(generatedReport.generatedDate), "PPP")}
                {generatedReport.dateFrom && generatedReport.dateTo && (
                  <span> | Period: {format(new Date(generatedReport.dateFrom), "PP")} - {format(new Date(generatedReport.dateTo), "PP")}</span>
                )}
              </CardDescription>
            </div>
            <ExportControls 
              data={generatedReport}
              filename={`${generatedReport.reportType}-${format(new Date(), "yyyy-MM-dd")}`}
              elementId="generated-report"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            {renderReportContent(generatedReport)}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const renderReportContent = (report: GeneratedReport) => {
  if (!report) return null;
  
  switch (report.reportType) {
    case 'financial-overview':
      const financialReport = report as FinancialOverviewReport;
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-2xl font-bold text-green-700">R {financialReport.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-green-600 mt-1">Total Revenue</div>
            </div>
            <div className="p-6 border rounded-lg bg-gradient-to-br from-red-50 to-red-100">
              <div className="text-2xl font-bold text-red-700">R {financialReport.totalExpenses.toLocaleString()}</div>
              <div className="text-sm text-red-600 mt-1">Total Expenses</div>
            </div>
            <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-2xl font-bold text-blue-700">R {financialReport.netProfit.toLocaleString()}</div>
              <div className="text-sm text-blue-600 mt-1">Net Profit</div>
            </div>
            <div className="p-6 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-2xl font-bold text-purple-700">{financialReport.grossProfitMargin}%</div>
              <div className="text-sm text-purple-600 mt-1">Profit Margin</div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Category Breakdown</h3>
            <div className="space-y-3">
              {financialReport.categories.map((category, index) => (
                <div key={index} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                  <span className="font-medium">{category.name}</span>
                  <span className="font-bold text-lg">R {category.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 'tax-summary':
      const taxReport = report as TaxSummaryReport;
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {Object.entries({
                'VAT Collected': taxReport.totalVAT,
                'Income Tax': taxReport.incomeTax,
                'Provisional Tax': taxReport.provisionalTax,
                'PAYE Deducted': taxReport.payeDeducted
              }).map(([label, value], index) => (
                <div key={index} className="flex justify-between p-4 border rounded-lg">
                  <span className="font-medium">{label}:</span>
                  <span className="font-bold">R {(value as number).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between p-4 border-2 border-red-200 rounded-lg bg-red-50">
                <span className="font-bold text-red-700">Total Tax Liability:</span>
                <span className="font-bold text-xl text-red-700">R {taxReport.totalTaxLiability.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      );
    case 'asset-register':
      const assetReport = report as AssetRegisterReport;
      return (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2">
                  <th className="text-left p-4 font-semibold">Asset Name</th>
                  <th className="text-right p-4 font-semibold">Cost</th>
                  <th className="text-right p-4 font-semibold">Depreciation</th>
                  <th className="text-right p-4 font-semibold">Book Value</th>
                </tr>
              </thead>
              <tbody>
                {assetReport.assets.map((asset, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{asset.name}</td>
                    <td className="p-4 text-right">R {asset.cost.toLocaleString()}</td>
                    <td className="p-4 text-right text-red-600">R {asset.depreciation.toLocaleString()}</td>
                    <td className="p-4 text-right font-semibold">R {asset.bookValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    default:
      const defaultReport = report as DefaultReport;
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">{defaultReport.message}</p>
          <p className="text-sm text-muted-foreground mt-3">
            This report type is being developed. More detailed content will be available soon.
          </p>
        </div>
      );
  }
};

export default ReportsGenerator;
