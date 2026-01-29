import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, FileBarChart, CreditCard, Layers, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AccountingCycle() {
  const navigate = useNavigate()
  
  const phases = [
    { name: 'Transactions', status: 'ready', icon: CreditCard, route: '/transaction-processing', description: 'Process daily transactions' },
    { name: 'Journal Entries', status: 'ready', icon: Layers, route: '/journal-entries', description: 'Record journal entries' },
    { name: 'Ledger Posting', status: 'ready', icon: Layers, route: '/general-ledger/posting', description: 'Post to general ledger' },
    { name: 'Trial Balance', status: 'pending', icon: FileBarChart, route: '/trial-balance', description: 'View trial balance' },
    { name: 'Financial Statements', status: 'pending', icon: FileBarChart, route: '/reports', description: 'Generate financial reports' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting Cycle</h1>
          <p className="text-muted-foreground mt-2">Manage your accounting cycle steps from transaction to financial statements.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {phases.map((p) => (
            <Card key={p.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <p.icon className="h-5 w-5 text-primary" />
                  {p.name}
                </CardTitle>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  {p.status === 'ready' ? (
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3" /> Ready
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(p.route)}
                >
                  Open
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

