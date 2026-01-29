import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, CheckCircle2, Rocket, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const InstallationWizard = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    modules: {
      accounting: true,
      payroll: false,
      inventory: false,
      assets: false
    }
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    // Simulate setup
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      toast({
        title: "Setup Complete",
        description: "Your Rigel workspace is ready!",
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Rigel Genesis Setup</DialogTitle>
          <DialogDescription>
            Configure your workspace in a few simple steps.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
            {/* Step Indicators */}
            <div className="flex justify-between mb-8 px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {s}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {s === 1 ? 'Profile' : s === 2 ? 'Modules' : 'Finish'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step 1: Profile */}
            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="grid gap-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                            id="companyName" 
                            placeholder="Acme Corp" 
                            value={formData.companyName}
                            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input 
                            id="industry" 
                            placeholder="Technology, Retail, etc." 
                            value={formData.industry}
                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Modules */}
            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <p className="text-sm text-muted-foreground mb-4">Select the modules you need for your business.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className={`cursor-pointer border-2 ${formData.modules.accounting ? 'border-primary' : 'border-border'}`}
                              onClick={() => setFormData({...formData, modules: {...formData.modules, accounting: !formData.modules.accounting}})}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <CheckCircle2 className={`h-5 w-5 ${formData.modules.accounting ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="font-medium">Accounting Core</div>
                            </CardContent>
                        </Card>
                        <Card className={`cursor-pointer border-2 ${formData.modules.payroll ? 'border-primary' : 'border-border'}`}
                              onClick={() => setFormData({...formData, modules: {...formData.modules, payroll: !formData.modules.payroll}})}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <CheckCircle2 className={`h-5 w-5 ${formData.modules.payroll ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="font-medium">Payroll</div>
                            </CardContent>
                        </Card>
                        <Card className={`cursor-pointer border-2 ${formData.modules.inventory ? 'border-primary' : 'border-border'}`}
                              onClick={() => setFormData({...formData, modules: {...formData.modules, inventory: !formData.modules.inventory}})}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <CheckCircle2 className={`h-5 w-5 ${formData.modules.inventory ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="font-medium">Inventory</div>
                            </CardContent>
                        </Card>
                        <Card className={`cursor-pointer border-2 ${formData.modules.assets ? 'border-primary' : 'border-border'}`}
                              onClick={() => setFormData({...formData, modules: {...formData.modules, assets: !formData.modules.assets}})}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <CheckCircle2 className={`h-5 w-5 ${formData.modules.assets ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="font-medium">Fixed Assets</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Step 3: Finish */}
            {step === 3 && (
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-right-4">
                    <Rocket className="h-16 w-16 text-primary mx-auto" />
                    <h3 className="text-xl font-semibold">Ready to Launch!</h3>
                    <p className="text-muted-foreground">
                        We've configured your workspace based on your preferences. You can always change these settings later.
                    </p>
                </div>
            )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
                Back
            </Button>
            {step < 3 ? (
                <Button onClick={handleNext}>Next</Button>
            ) : (
                <Button onClick={handleFinish} disabled={loading}>
                    {loading ? "Setting up..." : "Get Started"}
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
