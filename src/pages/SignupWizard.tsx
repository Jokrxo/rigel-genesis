import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { seedEntity } from '@/lib/seeding'
import { OwnershipForm } from '@/lib/coa-data'
import globeImage from '@/assets/globe.jpg'

export default function SignupWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState('1')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [ownership, setOwnership] = useState<OwnershipForm>('sole')
  const [inventorySystem, setInventorySystem] = useState<'periodic' | 'perpetual'>('periodic')
  const [preview, setPreview] = useState<any[]>([])
  const { toast } = useToast()

  const handleCreateEntity = async () => {
    try {
      const { entity, accounts } = await seedEntity(name, address, ownership, inventorySystem)
      setPreview(accounts || [])
      toast({ title: 'Entity created', description: 'Chart of Accounts seeded from template' })
      setStep('4')
    } catch (e) {
      toast({ title: 'Setup failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' })
    }
  }

  return (
    <MainLayout>
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
          <img 
            src={globeImage} 
            alt="Global Financial Network" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
            <div>
              <h1 className="text-3xl font-bold text-black">Welcome to Rigel</h1>
              <p className="text-black font-medium">Complete your setup to get started</p>
            </div>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-black">Sign-Up Wizard</CardTitle>
          <CardDescription className="text-black">Configure your business entity and auto-generate a master COA</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={step} onValueChange={setStep}>
            <TabsList className="mb-6">
              <TabsTrigger value="1">User Details</TabsTrigger>
              <TabsTrigger value="2">Business Profile</TabsTrigger>
              <TabsTrigger value="3">Ownership & Inventory</TabsTrigger>
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
              <div className="space-y-4 max-w-md">
                <div>
                  <Label>Form of Ownership</Label>
                  <Select value={ownership} onValueChange={(v) => setOwnership(v as OwnershipForm)}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select ownership" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole">Sole Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="pty_ltd">Private Company (Pty Ltd)</SelectItem>
                      <SelectItem value="soe">State Owned Entity (SOE)</SelectItem>
                      <SelectItem value="corp">Corporation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Inventory System</Label>
                  <Select value={inventorySystem} onValueChange={(v) => setInventorySystem(v as 'periodic' | 'perpetual')}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select inventory system" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="periodic">Periodic (Cost of Sales at end)</SelectItem>
                      <SelectItem value="perpetual">Perpetual (Real-time tracking)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep('2')}>Back</Button>
                <Button onClick={handleCreateEntity}>Create Entity + Seed COA</Button>
              </div>
            </TabsContent>

            <TabsContent value="4">
              <div className="mb-4 flex justify-end">
                 <Button onClick={() => navigate('/company-profile')}>Go to Company Profile</Button>
              </div>
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

