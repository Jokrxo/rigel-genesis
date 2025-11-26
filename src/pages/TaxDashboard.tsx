import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TaxDashboard() {
  const [data, setData] = useState<any | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/tax/report?entityId=demo')
        if (!res.ok) throw new Error('Failed to fetch tax report')
        const d = await res.json()
        setData(d)
      } catch (e) {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
      }
    }
    load()
  }, [])

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Tax Dashboard</CardTitle>
          <CardDescription>VAT, depreciation, and income tax overview</CardDescription>
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
                <Card><CardHeader><CardTitle className="text-sm">VAT Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Number(data?.vatRate ?? 0).toFixed(2)}</div></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">VAT Due</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Number(data?.vatDue ?? 0).toFixed(2)}</div></CardContent></Card>
              </div>
            </TabsContent>
            <TabsContent value="depr">
              <Card><CardHeader><CardTitle className="text-sm">Depreciation Expense</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Number(data?.depreciationExpense ?? 0).toFixed(2)}</div></CardContent></Card>
            </TabsContent>
            <TabsContent value="income">
              <div className="grid grid-cols-2 gap-4">
                <Card><CardHeader><CardTitle className="text-sm">Taxable Income</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Number(data?.taxableIncome ?? 0).toFixed(2)}</div></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm">Corporate Tax</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Number(data?.corpTax ?? 0).toFixed(2)}</div></CardContent></Card>
              </div>
              <Button variant="outline" className="mt-6"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainLayout>
  )
}

