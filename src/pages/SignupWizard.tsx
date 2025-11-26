import { useState } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

type OwnershipForm = 'sole' | 'partnership' | 'llc' | 'corp'

export default function SignupWizard() {
  const [step, setStep] = useState('1')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [ownership, setOwnership] = useState<OwnershipForm>('sole')
  const [preview, setPreview] = useState<any[]>([])
  const { toast } = useToast()

  const loadPreview = async () => {
    try {
      const res = await fetch('/api/entities/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, ownership })
      })
      if (!res.ok) throw new Error('Failed to setup entity')
      const data = await res.json()
      setPreview(data.accountsPreview || [])
      toast({ title: 'Entity created', description: 'Chart of Accounts seeded from template' })
      setStep('4')
    } catch (e) {
      toast({ title: 'Setup failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
    }
  }

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Sign-Up Wizard</CardTitle>
          <CardDescription>Configure your business entity and auto-generate a master COA</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={step} onValueChange={setStep}>
            <TabsList className="mb-6">
              <TabsTrigger value="1">User Details</TabsTrigger>
              <TabsTrigger value="2">Business Profile</TabsTrigger>
              <TabsTrigger value="3">Ownership (FOO)</TabsTrigger>
              <TabsTrigger value="4">COA Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Rigel Corp" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Finance St" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep('2')}>Next</Button>
              </div>
            </TabsContent>

            <TabsContent value="2">
              <p className="text-sm text-muted-foreground">Confirm your business profile details. You can edit settings later.</p>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep('1')}>Back</Button>
                <Button onClick={() => setStep('3')}>Next</Button>
              </div>
            </TabsContent>

            <TabsContent value="3">
              <div className="max-w-md">
                <Label>Form of Ownership</Label>
                <Select value={ownership} onValueChange={(v) => setOwnership(v as OwnershipForm)}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select ownership" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sole">Sole Proprietorship</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="corp">Corporation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep('2')}>Back</Button>
                <Button onClick={loadPreview}>Create Entity + Seed COA</Button>
              </div>
            </TabsContent>

            <TabsContent value="4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Code</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((a) => (
                      <tr key={a.id || a.code}>
                        <td className="p-2 font-mono">{a.code}</td>
                        <td className="p-2">{a.name}</td>
                        <td className="p-2">{a.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainLayout>
  )
}

