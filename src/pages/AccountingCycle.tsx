import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, FileBarChart, CreditCard, Layers, ArrowRight, Scale, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AccountingCycle() {
  const navigate = useNavigate()
  
  const phases = [
    { 
        name: '1. Transactions', 
        status: 'ready', 
        icon: CreditCard, 
        route: '/transaction-processing', 
        description: 'Process daily business transactions (Sales, Purchases, Receipts, Payments).' 
    },
    { 
        name: '2. Journal Entries (Standard)', 
        status: 'ready', 
        icon: FileText, 
        route: '/journal-entries', 
        description: 'Record standard journal entries during the financial year.' 
    },
    { 
        name: '3. Ledger Posting', 
        status: 'ready', 
        icon: Layers, 
        route: '/general-ledger/posting', 
        description: 'Post journal entries to the General Ledger.' 
    },
    { 
        name: '4. Pre-Adjustment Trial Balance', 
        status: 'pending', 
        icon: Scale, 
        route: '/trial-balance', 
        description: 'View unadjusted account balances to verify total debits equal credits.' 
    },
    { 
        name: '5. Year-End Adjustments', 
        status: 'pending', 
        icon: FileText, 
        route: '/journal-entries', 
        description: 'Record adjusting entries for accruals, deferrals, depreciation, etc.' 
    },
    { 
        name: '6. Post-Adjustment Trial Balance', 
        status: 'pending', 
        icon: Scale, 
        route: '/trial-balance', 
        description: 'View final account balances after all adjustments are posted.' 
    },
    { 
        name: '7. Financial Statements', 
        status: 'pending', 
        icon: FileBarChart, 
        route: '/reports', 
        description: 'Generate Income Statement, Balance Sheet, and Cash Flow Statement.' 
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting Cycle</h1>
          <p className="text-muted-foreground mt-2">Manage your full accounting cycle from initial transactions to final reporting.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {phases.map((p) => (
            <Card key={p.name} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <p.icon className="h-5 w-5 text-primary" />
                  {p.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">{p.description}</CardDescription>
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
                  Open Module
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

