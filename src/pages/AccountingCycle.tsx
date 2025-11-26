import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, FileBarChart, CreditCard, Layers } from 'lucide-react'

export default function AccountingCycle() {
  const phases = [
    { name: 'Transactions', status: 'ready', icon: CreditCard },
    { name: 'Journal Entries', status: 'ready', icon: Layers },
    { name: 'Ledger Posting', status: 'ready', icon: Layers },
    { name: 'Trial Balance', status: 'pending', icon: FileBarChart },
    { name: 'Financial Statements', status: 'pending', icon: FileBarChart },
  ]

  return (
    <MainLayout>
      <div className="grid gap-4 md:grid-cols-3">
        {phases.map((p) => (
          <Card key={p.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <p.icon className="h-5 w-5" />
                {p.name}
              </CardTitle>
              <CardDescription>Cycle status</CardDescription>
            </CardHeader>
            <CardContent>
              {p.status === 'ready' ? (
                <Badge variant="outline" className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Ready</Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-4 w-4" /> Pending</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  )
}

