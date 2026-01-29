import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImpairmentModule() {
  const { toast } = useToast();
  const [assets, setAssets] = useState([
    { id: "AST-001", name: "Delivery Truck", carryingAmount: 250000, recoverableAmount: 180000, impairment: 70000, status: "Impaired" },
    { id: "AST-005", name: "Office Building", carryingAmount: 5000000, recoverableAmount: 5200000, impairment: 0, status: "Good" },
  ]);

  const [formData, setFormData] = useState({
    assetId: "",
    carryingAmount: "",
    recoverableAmount: "",
    reason: ""
  });

  const handleCalculate = () => {
    const carrying = parseFloat(formData.carryingAmount);
    const recoverable = parseFloat(formData.recoverableAmount);
    
    if (isNaN(carrying) || isNaN(recoverable)) return;

    const impairment = Math.max(0, carrying - recoverable);
    
    if (impairment > 0) {
        toast({
            title: "Impairment Detected",
            description: `Calculated Impairment Loss: R ${impairment.toLocaleString()}`,
            variant: "destructive"
        });
    } else {
        toast({
            title: "No Impairment",
            description: "Asset recoverable amount exceeds carrying amount.",
        });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Impairment</h1>
          <p className="text-muted-foreground">IAS 36 Impairment of Assets calculation and tracking.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Impairment Calculator</CardTitle>
                    <CardDescription>Determine if an asset's value has diminished.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Asset ID / Name</Label>
                        <Input 
                            placeholder="e.g. Machinery A" 
                            value={formData.assetId}
                            onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Carrying Amount</Label>
                            <Input 
                                type="number" 
                                placeholder="0.00" 
                                value={formData.carryingAmount}
                                onChange={(e) => setFormData({...formData, carryingAmount: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Recoverable Amount</Label>
                            <Input 
                                type="number" 
                                placeholder="0.00" 
                                value={formData.recoverableAmount}
                                onChange={(e) => setFormData({...formData, recoverableAmount: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Reason for Assessment</Label>
                        <Select onValueChange={(v) => setFormData({...formData, reason: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select indicator..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="physical">Physical Damage</SelectItem>
                                <SelectItem value="market">Market Value Decline</SelectItem>
                                <SelectItem value="obsolescence">Obsolescence</SelectItem>
                                <SelectItem value="performance">Worse Economic Performance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" onClick={handleCalculate}>
                        <TrendingDown className="mr-2 h-4 w-4" /> Calculate & Record
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Impairments</CardTitle>
                    <CardDescription>Tracked asset adjustments.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset</TableHead>
                                <TableHead>Carrying</TableHead>
                                <TableHead>Recoverable</TableHead>
                                <TableHead>Loss</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell className="font-medium">{asset.name}</TableCell>
                                    <TableCell>R {asset.carryingAmount.toLocaleString()}</TableCell>
                                    <TableCell>R {asset.recoverableAmount.toLocaleString()}</TableCell>
                                    <TableCell className={asset.impairment > 0 ? "text-red-500 font-bold" : ""}>
                                        {asset.impairment > 0 ? `R ${asset.impairment.toLocaleString()}` : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
