import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Download, TrendingUp, TrendingDown } from "lucide-react";

interface FinancialStatement {
  id: string;
  statement_type: string;
  period_start: string;
  period_end: string;
  statement_data: any;
  ratios: any;
  generated_at: string;
}

export const FinancialStatementsView = () => {
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('financial_statements')
      .select('*')
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error fetching financial statements:', error);
      return;
    }

    setStatements(data || []);
    setIsLoading(false);
  };

  const getLatestStatement = (type: string) => {
    return statements.find(s => s.statement_type === type);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount || 0);
  };

  const renderIncomeStatement = () => {
    const statement = getLatestStatement('income_statement');
    if (!statement) return <p className="text-muted-foreground">No income statement available</p>;

    const data = statement.statement_data;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(data.revenue)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Net Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.netIncome)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Operating Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.expenses.operatingExpenses || {}).map(([category, amount]) => (
                <div key={category} className="flex justify-between">
                  <span>{category}</span>
                  <span className="text-red-600">{formatCurrency(amount as number)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Bank Charges</span>
                <span className="text-red-600">{formatCurrency(data.expenses.bankCharges)}</span>
              </div>
              <div className="flex justify-between">
                <span>Interest</span>
                <span className="text-red-600">{formatCurrency(data.expenses.interest)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCashFlowStatement = () => {
    const statement = getLatestStatement('cash_flow');
    if (!statement) return <p className="text-muted-foreground">No cash flow statement available</p>;

    const data = statement.statement_data;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Operating Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Net Income</span>
                  <span>{formatCurrency(data.operatingActivities.netIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Adjustments</span>
                  <span>{formatCurrency(data.operatingActivities.adjustments)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Investing Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-semibold ${data.investingActivities >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.investingActivities)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Financing Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-semibold ${data.financingActivities >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.financingActivities)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderRatios = () => {
    const latestStatement = statements[0];
    if (!latestStatement?.ratios) return <p className="text-muted-foreground">No financial ratios available</p>;

    const ratios = latestStatement.ratios;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cash Ratio</CardTitle>
            <CardDescription>Liquidity measurement</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ratios.cashRatio?.toFixed(2) || '0.00'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Ratio</CardTitle>
            <CardDescription>Expense to income ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(ratios.expenseRatio * 100)?.toFixed(1) || '0.0'}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Net Cash Flow</CardTitle>
            <CardDescription>Period cash movement</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${ratios.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(ratios.netCashFlow)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Financial Statements
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </CardTitle>
          <CardDescription>
            AI-generated financial statements from your transaction data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statements.length > 0 && (
            <div className="flex gap-2 mb-4">
              <Badge variant="outline">
                Latest Period: {new Date(statements[0].period_start).toLocaleDateString()} - {new Date(statements[0].period_end).toLocaleDateString()}
              </Badge>
              <Badge variant="secondary">
                Generated: {new Date(statements[0].generated_at).toLocaleDateString()}
              </Badge>
            </div>
          )}

          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income">Income Statement</TabsTrigger>
              <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
              <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="mt-6">
              {renderIncomeStatement()}
            </TabsContent>

            <TabsContent value="cashflow" className="mt-6">
              {renderCashFlowStatement()}
            </TabsContent>

            <TabsContent value="ratios" className="mt-6">
              {renderRatios()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};