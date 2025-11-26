import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { apiFetch } from '@/api/client'

interface Props {
  assetId: string
  open: boolean
  onClose: () => void
}

export function AssetDisposalWizard({ assetId, open, onClose }: Props) {
  const [step, setStep] = useState('1')
  const [disposalDate, setDisposalDate] = useState<string>('')
  const [sellingPrice, setSellingPrice] = useState<number>(0)
  const [method, setMethod] = useState<'cash'|'credit'>('cash')
  const { toast } = useToast()

  const submit = async () => {
    try {
      const res = await apiFetch(`/api/disposals/${assetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellingPrice, disposalDate, method })
      })
      if (!res.ok) throw new Error('Failed to dispose asset')
      const data = await res.json()
      toast({ title: 'Disposal complete', description: `Profit/Loss: ${Number(data.profitLoss).toFixed(2)}` })
      onClose()
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asset Disposal</DialogTitle>
          <DialogDescription>Follow the steps to record a disposal with accurate journal entries</DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent>
            <Tabs value={step} onValueChange={setStep}>
              <TabsList className="mb-4">
                <TabsTrigger value="1">Select Asset</TabsTrigger>
                <TabsTrigger value="2">Remove Cost</TabsTrigger>
                <TabsTrigger value="3">Remove Accum Depr</TabsTrigger>
                <TabsTrigger value="4">Record Sale</TabsTrigger>
                <TabsTrigger value="5">Gain/Loss</TabsTrigger>
              </TabsList>

              <TabsContent value="1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Disposal Date</Label>
                    <Input type="date" value={disposalDate} onChange={e => setDisposalDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Selling Price</Label>
                    <Input type="number" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Method</Label>
                    <Select value={method} onValueChange={(v) => setMethod(v as 'cash'|'credit')}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end"><Button onClick={() => setStep('2')}>Next</Button></div>
              </TabsContent>

              <TabsContent value="2">
                <p className="text-sm text-muted-foreground">Journal: Debit Accumulated Depreciation, Credit Asset Cost</p>
                <div className="mt-6 flex justify-between"><Button variant="outline" onClick={() => setStep('1')}>Back</Button><Button onClick={() => setStep('3')}>Next</Button></div>
              </TabsContent>

              <TabsContent value="3">
                <p className="text-sm text-muted-foreground">Auto-compute accumulated depreciation up to disposal date</p>
                <div className="mt-6 flex justify-between"><Button variant="outline" onClick={() => setStep('2')}>Back</Button><Button onClick={() => setStep('4')}>Next</Button></div>
              </TabsContent>

              <TabsContent value="4">
                <p className="text-sm text-muted-foreground">Record sale proceeds to Cash or Accounts Receivable</p>
                <div className="mt-6 flex justify-between"><Button variant="outline" onClick={() => setStep('3')}>Back</Button><Button onClick={() => setStep('5')}>Next</Button></div>
              </TabsContent>

              <TabsContent value="5">
                <p className="text-sm text-muted-foreground">Gain/Loss entry created automatically based on net book value</p>
                <div className="mt-6 flex justify-between"><Button variant="outline" onClick={() => setStep('4')}>Back</Button><Button onClick={submit}>Submit Disposal</Button></div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

