import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Printer, CheckCircle, Search, AlertTriangle, Send } from 'lucide-react'
import { trialBalanceApi } from '@/lib/trial-balance-api'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function TrialBalance() {
  const { toast } = useToast()
  const [rows, setRows] = useState<{ code: string, name: string, type: string, debit: number, credit: number }[]>([])
  const [totals, setTotals] = useState<{ debit: number, credit: number }>({ debit: 0, credit: 0 })
  const [view, setView] = useState<'pre' | 'post'>('pre')
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const d = await trialBalanceApi.get('demo', view)
        setRows(d.rows || [])
        setTotals(d.totals || { debit: 0, credit: 0 })
      } catch (error) {
        toast({ title: "Error", description: "Failed to load trial balance", variant: "destructive" })
      }
    }
    load()
  }, [view, toast])

  const filteredRows = rows.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.code.includes(searchQuery)
  );

  const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;

  const handleApprove = () => {
      toast({
          title: "Trial Balance Approved",
          description: `The ${view === 'pre' ? 'Pre-Adjustment' : 'Post-Adjustment'} Trial Balance has been approved and locked.`,
      })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Trial Balance</h1>
                <p className="text-muted-foreground">View account balances before and after adjustments.</p>
            </div>
            <div className="flex gap-2">
                 <Button variant="default" onClick={handleApprove} disabled={!isBalanced}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                 </Button>
                 <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" /> Print
                 </Button>
                 <Button variant="outline" onClick={async () => {
                    const blob = await trialBalanceApi.exportPdf('demo')
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `trial-balance-${view}.pdf`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}>
                    <Download className="mr-2 h-4 w-4" /> Export PDF
                  </Button>
            </div>
        </div>

        {!isBalanced && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Trial Balance Unbalanced</AlertTitle>
                <AlertDescription>
                    The total debits (R {totals.debit.toFixed(2)}) do not equal total credits (R {totals.credit.toFixed(2)}). Difference: R {Math.abs(totals.debit - totals.credit).toFixed(2)}. Please review journal entries.
                </AlertDescription>
            </Alert>
        )}

        <Tabs defaultValue="pre" className="w-full" onValueChange={(v) => setView(v as 'pre' | 'post')}>
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="pre">Pre-Adjustment</TabsTrigger>
                <TabsTrigger value="post">Post-Adjustment</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
                <Card>
                    <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{view === 'pre' ? 'Pre-Adjustment Trial Balance' : 'Post-Adjustment Trial Balance'}</CardTitle>
                            <CardDescription>
                                {view === 'pre' 
                                    ? 'Balances excluding year-end adjustments.' 
                                    : 'Final balances including all adjustments.'}
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search accounts..." 
                                className="pl-8" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Account Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRows.map((r) => (
                            <TableRow key={r.code}>
                                <TableCell className="font-mono">{r.code}</TableCell>
                                <TableCell>{r.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">{r.type}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono">{r.debit > 0 ? r.debit.toFixed(2) : '-'}</TableCell>
                                <TableCell className="text-right font-mono">{r.credit > 0 ? r.credit.toFixed(2) : '-'}</TableCell>
                            </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 font-medium">
                            <TableCell colSpan={3} className="text-right">Totals</TableCell>
                            <TableCell className="text-right border-t-2 border-foreground">{totals.debit.toFixed(2)}</TableCell>
                            <TableCell className="text-right border-t-2 border-foreground">{totals.credit.toFixed(2)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell colSpan={5} className="text-center pt-4">
                                    {Math.abs(totals.debit - totals.credit) < 0.01 ? (
                                        <div className="flex items-center justify-center text-green-600 gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Balance is balanced</span>
                                        </div>
                                    ) : (
                                        <div className="text-red-500 font-bold">
                                            Difference: {Math.abs(totals.debit - totals.credit).toFixed(2)}
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                        </Table>
                    </div>
                    </CardContent>
                </Card>
            </div>
        </Tabs>
      </div>
    </MainLayout>
  )
}
