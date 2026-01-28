import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useFinancialData } from '@/hooks/useFinancialData'

export default function TaxDashboard() {
  const { getIncomeStatementData, getDepreciationExpense } = useFinancialData();
  const [data, setData] = useState<any | null>({
    vatRate: 15,
    vatDue: 0,
    depreciationExpense: 0,
    taxableIncome: 0,
    corpTax: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    // Calculate tax data from financial records
    const start = new Date(new Date().getFullYear(), 0, 1);
    const end = new Date();
    const incomeData = getIncomeStatementData(start, end);

    // Get depreciation from asset register
    const depreciationExpense = getDepreciationExpense(start, end);

    // Simple estimation logic
    // VAT Due = Output VAT (on income) - Input VAT (on expenses)
    // For now we assume a flat rate estimation if exact tax transactions aren't tagged
    // In a real system, we'd sum up 'tax_payment' or 'vat_payment' or specific tax line items
    
    // Using 15% VAT rate for estimation on taxable supplies
    const estimatedOutputVat = incomeData.revenue * 0.15; 
    const estimatedInputVat = incomeData.expenses * 0.15;
    const vatDue = estimatedOutputVat - estimatedInputVat;

    // Adjust taxable income for depreciation (deductible)
    // Note: incomeData.netProfit is (Revenue - Expenses), where Expenses currently don't include depreciation unless we added it manually.
    // So we subtract depreciationExpense from netProfit to get Taxable Income.
    const taxableIncome = incomeData.netProfit - depreciationExpense; 
    const corpTax = taxableIncome > 0 ? taxableIncome * 0.27 : 0; // 27% CIT rate

    setData({
      vatRate: 15,
      vatDue: vatDue,
      depreciationExpense: depreciationExpense,
      taxableIncome: taxableIncome,
      corpTax: corpTax
    });

  }, [getIncomeStatementData, getDepreciationExpense])

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Tax Dashboard</CardTitle>
          <CardDescription>VAT, depreciation, and income tax overview (Estimated)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vat">
            <TabsList className="mb-4">
              <TabsTrigger value="vat">VAT</TabsTrigger>
              <TabsTrigger value="depr">Depreciation</TabsTrigger>
              <TabsTrigger value="income">Income Tax</TabsTrigger>
            </TabsList>
            <TabsContent value="vat">
              <div className="grid grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle className="text-sm">VAT Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Number(data?.vatRate ?? 0).toFixed(2)}%</div></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Est. VAT Due</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R {Number(data?.vatDue ?? 0).toFixed(2)}</div></CardContent></Card>
              </div>
            </TabsContent>
            <TabsContent value="depr">
              <Card><CardHeader><CardTitle className="text-sm">Depreciation Expense</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R {Number(data?.depreciationExpense ?? 0).toFixed(2)}</div></CardContent></Card>
            </TabsContent>
            <TabsContent value="income">
              <div className="grid grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle className="text-sm">Taxable Income</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R {Number(data?.taxableIncome ?? 0).toFixed(2)}</div></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Est. Corporate Tax</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R {Number(data?.corpTax ?? 0).toFixed(2)}</div></CardContent></Card>
              </div>
              <Button variant="outline" className="mt-6"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainLayout>
  )
}
