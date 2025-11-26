import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'

export default function TrialBalance() {
  const [rows, setRows] = useState<{ code: string, name: string, type: string, debit: number, credit: number }[]>([])
  const [totals, setTotals] = useState<{ debit: number, credit: number }>({ debit: 0, credit: 0 })

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/trial-balance?entityId=demo')
      const d = await res.json()
      setRows(d.rows || [])
      setTotals(d.totals || { debit: 0, credit: 0 })
    }
    load()
  }, [])

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
          <CardDescription>Debits and credits by account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="mb-4" onClick={async () => {
            const res = await fetch('/api/reports/trial-balance?entityId=demo')
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'trial-balance.pdf'
            a.click()
            URL.revokeObjectURL(url)
          }}><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.code}>
                    <TableCell className="font-mono">{r.code}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.debit.toFixed(2)}</TableCell>
                    <TableCell>{r.credit.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-bold">Totals</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-bold">{totals.debit.toFixed(2)}</TableCell>
                  <TableCell className="font-bold">{totals.credit.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  )
}
