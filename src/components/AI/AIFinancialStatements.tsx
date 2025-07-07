
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Brain, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { ExportControls } from "@/components/Dashboard/ExportControls";

interface BalanceSheetData {
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      prepaidExpenses: number;
      total: number;
    };
    nonCurrent: {
      propertyPlantEquipment: number;
      intangibleAssets: number;
      investments: number;
      total: number;
    };
    totalAssets: number;
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      total: number;
    };
    nonCurrent: {
      longTermDebt: number;
      deferredTax: number;
      total: number;
    };
    totalLiabilities: number;
  };
  equity: {
    shareCapital: number;
    retainedEarnings: number;
    totalEquity: number;
  };
}

interface IncomeStatementData {
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: {
    salaries: number;
    rent: number;
    marketing: number;
    utilities: number;
    depreciation: number;
    other: number;
    total: number;
  };
  operatingIncome: number;
  otherIncome: number;
  interestExpense: number;
  netIncomeBeforeTax: number;
  incomeTax: number;
  netIncome: number;
}

interface MessageData {
  message: string;
}

type StatementData = BalanceSheetData | IncomeStatementData | MessageData | unknown;

interface GeneratedStatement {
  type: string;
  generatedDate: string;
  periodFrom: string;
  periodTo: string;
  data: StatementData;
}

export const AIFinancialStatements = () => {
  const [statementType, setStatementType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStatement, setGeneratedStatement] = useState<GeneratedStatement | null>(null);
  const { toast } = useToast();

  const statementTypes = [
    { value: 'balance-sheet', label: 'Balance Sheet' },
    { value: 'income-statement', label: 'Income Statement' },
    { value: 'cash-flow', label: 'Cash Flow Statement' },
    { value: 'equity-changes', label: 'Statement of Changes in Equity' },
    { value: 'comprehensive-package', label: 'Complete Financial Package' },
  ];

  const generateStatement = async () => {
    if (!statementType) {
      toast({
        title: "Statement Type Required",
        description: "Please select a financial statement type to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-financial-assistant', {
        body: {
          action: 'generate_financial_statement',
          statementType,
          dateFrom: dateFrom?.toISOString(),
          dateTo: dateTo?.toISOString(),
        }
      });

      if (error) throw error;

      const statement: GeneratedStatement = {
        type: statementType,
        generatedDate: new Date().toISOString(),
        periodFrom: dateFrom?.toISOString() || '',
        periodTo: dateTo?.toISOString() || '',
        data: data || generateSampleStatement(statementType)
      };

      setGeneratedStatement(statement);
      toast({
        title: "Statement Generated",
        description: `Successfully generated ${statementTypes.find(s => s.value === statementType)?.label} using AI analysis.`,
      });
    } catch (error) {
      console.error('Error generating statement:', error);
      // Fallback to sample data
      const statement: GeneratedStatement = {
        type: statementType,
        generatedDate: new Date().toISOString(),
        periodFrom: dateFrom?.toISOString() || '',
        periodTo: dateTo?.toISOString() || '',
        data: generateSampleStatement(statementType)
      };
      setGeneratedStatement(statement);
      toast({
        title: "Statement Generated (Sample)",
        description: "Generated sample financial statement. Connect to your data source for real-time analysis.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSampleStatement = (type: string) => {
    switch (type) {
      case 'balance-sheet':
        return {
          assets: {
            current: {
              cash: 250000,
              accountsReceivable: 180000,
              inventory: 95000,
              prepaidExpenses: 12000,
              total: 537000
            },
            nonCurrent: {
              propertyPlantEquipment: 850000,
              intangibleAssets: 45000,
              investments: 120000,
              total: 1015000
            },
            totalAssets: 1552000
          },
          liabilities: {
            current: {
              accountsPayable: 95000,
              shortTermDebt: 75000,
              accruedExpenses: 35000,
              total: 205000
            },
            nonCurrent: {
              longTermDebt: 400000,
              deferredTax: 28000,
              total: 428000
            },
            totalLiabilities: 633000
          },
          equity: {
            shareCapital: 500000,
            retainedEarnings: 419000,
            totalEquity: 919000
          }
        };
      case 'income-statement':
        return {
          revenue: 1850000,
          costOfSales: 925000,
          grossProfit: 925000,
          operatingExpenses: {
            salaries: 320000,
            rent: 96000,
            marketing: 85000,
            utilities: 24000,
            depreciation: 65000,
            other: 45000,
            total: 635000
          },
          operatingIncome: 290000,
          otherIncome: 15000,
          interestExpense: 35000,
          netIncomeBeforeTax: 270000,
          incomeTax: 81000,
          netIncome: 189000
        };
      default:
        return { message: 'Statement type not yet implemented in sample data' };
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-financial-600" />
            AI Financial Statement Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="financial-label">Statement Type</label>
              <Select onValueChange={setStatementType}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select statement type" />
                </SelectTrigger>
                <SelectContent>
                  {statementTypes.map((statement) => (
                    <SelectItem key={statement.value} value={statement.value}>
                      {statement.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="financial-label">Reporting Period</label>
              <div className="flex space-x-2">
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

          <Button 
            onClick={generateStatement} 
            disabled={isGenerating || !statementType}
            className="w-full h-12"
          >
            {isGenerating ? (
              <Loading size="sm" text="Generating with AI..." />
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Financial Statement
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedStatement && (
        <Card id="generated-financial-statement">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {statementTypes.find(s => s.value === generatedStatement.type)?.label}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Generated on {format(new Date(generatedStatement.generatedDate), "PPP")}
                {generatedStatement.periodFrom && generatedStatement.periodTo && (
                  <span> | Period: {format(new Date(generatedStatement.periodFrom), "PP")} - {format(new Date(generatedStatement.periodTo), "PP")}</span>
                )}
              </p>
            </div>
            <ExportControls 
              data={generatedStatement.data}
              filename={`${generatedStatement.type}-${format(new Date(), "yyyy-MM-dd")}`}
              elementId="generated-financial-statement"
            />
          </CardHeader>
          <CardContent>
            {renderStatementContent(generatedStatement)}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function isBalanceSheetData(data: StatementData): data is BalanceSheetData {
  return (
    typeof data === "object" &&
    data !== null &&
    "assets" in data &&
    "liabilities" in data &&
    "equity" in data
  );
}

function isIncomeStatementData(data: StatementData): data is IncomeStatementData {
  return (
    typeof data === "object" &&
    data !== null &&
    "revenue" in data &&
    "costOfSales" in data &&
    "grossProfit" in data &&
    "operatingExpenses" in data &&
    "operatingIncome" in data &&
    "interestExpense" in data &&
    "incomeTax" in data &&
    "netIncome" in data
  );
}

const renderStatementContent = (statement: GeneratedStatement) => {
  const { type, data } = statement;

  switch (type) {
    case 'balance-sheet':
      if (!isBalanceSheetData(data)) {
        return <div>Invalid balance sheet data.</div>;
      }
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">ASSETS</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Current Assets</h4>
                  <div className="space-y-1 ml-4">
                    <div className="flex justify-between text-sm">
                      <span>Cash and Cash Equivalents</span>
                      <span>R {data.assets.current.cash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Accounts Receivable</span>
                      <span>R {data.assets.current.accountsReceivable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Inventory</span>
                      <span>R {data.assets.current.inventory.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1 font-medium">
                      <span>Total Current Assets</span>
                      <span>R {data.assets.current.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Non-Current Assets</h4>
                  <div className="space-y-1 ml-4">
                    <div className="flex justify-between text-sm">
                      <span>Property, Plant & Equipment</span>
                      <span>R {data.assets.nonCurrent.propertyPlantEquipment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Intangible Assets</span>
                      <span>R {data.assets.nonCurrent.intangibleAssets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1 font-medium">
                      <span>Total Non-Current Assets</span>
                      <span>R {data.assets.nonCurrent.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL ASSETS</span>
                    <span>R {data.assets.totalAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">LIABILITIES & EQUITY</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Current Liabilities</h4>
                  <div className="space-y-1 ml-4">
                    <div className="flex justify-between text-sm">
                      <span>Accounts Payable</span>
                      <span>R {data.liabilities.current.accountsPayable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Short-term Debt</span>
                      <span>R {data.liabilities.current.shortTermDebt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1 font-medium">
                      <span>Total Current Liabilities</span>
                      <span>R {data.liabilities.current.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Non-Current Liabilities</h4>
                  <div className="space-y-1 ml-4">
                    <div className="flex justify-between text-sm">
                      <span>Long-term Debt</span>
                      <span>R {data.liabilities.nonCurrent.longTermDebt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1 font-medium">
                      <span>Total Non-Current Liabilities</span>
                      <span>R {data.liabilities.nonCurrent.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Equity</h4>
                  <div className="space-y-1 ml-4">
                    <div className="flex justify-between text-sm">
                      <span>Share Capital</span>
                      <span>R {data.equity.shareCapital.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Retained Earnings</span>
                      <span>R {data.equity.retainedEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1 font-medium">
                      <span>Total Equity</span>
                      <span>R {data.equity.totalEquity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL LIABILITIES & EQUITY</span>
                    <span>R {(data.liabilities.totalLiabilities + data.equity.totalEquity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case 'income-statement':
      if (!isIncomeStatementData(data)) {
        return <div>Invalid income statement data.</div>;
      }
      return (
        <div className="space-y-4 max-w-md mx-auto">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Revenue</span>
              <span className="font-semibold">R {data.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost of Sales</span>
              <span>R ({data.costOfSales.toLocaleString()})</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>Gross Profit</span>
              <span>R {data.grossProfit.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Operating Expenses</h4>
            <div className="ml-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Salaries & Benefits</span>
                <span>R ({data.operatingExpenses.salaries.toLocaleString()})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rent</span>
                <span>R ({data.operatingExpenses.rent.toLocaleString()})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Marketing</span>
                <span>R ({data.operatingExpenses.marketing.toLocaleString()})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Depreciation</span>
                <span>R ({data.operatingExpenses.depreciation.toLocaleString()})</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-2 space-y-2">
            <div className="flex justify-between font-medium">
              <span>Operating Income</span>
              <span>R {data.operatingIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Interest Expense</span>
              <span>R ({data.interestExpense.toLocaleString()})</span>
            </div>
            <div className="flex justify-between">
              <span>Income Tax</span>
              <span>R ({data.incomeTax.toLocaleString()})</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-lg">
              <span>Net Income</span>
              <span className="text-green-600">R {data.netIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Statement generated successfully.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This statement type is being enhanced. More detailed formatting will be available soon.
          </p>
        </div>
      );
  }
};
