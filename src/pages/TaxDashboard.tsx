import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useFinancialData } from '@/hooks/useFinancialData'
import { taxApi, TaxSummary } from '@/lib/tax-api'

export default function TaxDashboard() {
  const { getIncomeStatementData, getDepreciationExpense } = useFinancialData();
  const [data, setData] = useState<TaxSummary | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const server = await taxApi.getSummary('demo')
        setData(server)
      } catch {
        const start = new Date(new Date().getFullYear(), 0, 1);
        const end = new Date();
        const incomeData = getIncomeStatementData(start, end);
        const depreciationExpense = getDepreciationExpense(start, end);
        const vatRate = 15;
        const estimatedOutputVat = incomeData.revenue * (vatRate / 100);
        const estimatedInputVat = incomeData.expenses * (vatRate / 100);
        const vatDue = estimatedOutputVat - estimatedInputVat;
        const taxableIncome = incomeData.netProfit - depreciationExpense;
        const corpTax = taxableIncome > 0 ? taxableIncome * 0.27 : 0;
        setData({
          vatRate,
          vatDue,
          depreciationExpense,
          taxableIncome,
          corpTax,
          revenue: incomeData.revenue,
          expenses: incomeData.expenses,
        });
        toast({ title: 'Using local estimates', description: 'Tax API unavailable, computed values locally.' })
      }
    }
    load()
  }, [getIncomeStatementData, getDepreciationExpense, toast])

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
