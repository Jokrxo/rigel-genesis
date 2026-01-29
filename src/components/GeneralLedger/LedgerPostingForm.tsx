import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LedgerPostingForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [formData, setFormData] = useState({
    account: "",
    description: "",
    reference: "",
    debit: "",
    credit: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account || !date || (!formData.debit && !formData.credit)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Account, Date, and either Debit or Credit).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Success",
        description: "Transaction posted to General Ledger successfully.",
      });
      // Reset form
      setFormData({
        account: "",
        description: "",
        reference: "",
        debit: "",
        credit: "",
      });
      setDate(new Date());
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post to General Ledger</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                name="reference"
                placeholder="e.g. INV-001"
                value={formData.reference}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select
                value={formData.account}
                onValueChange={(val) => handleSelectChange("account", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1000 - Cash</SelectItem>
                  <SelectItem value="1100">1100 - Accounts Receivable</SelectItem>
                  <SelectItem value="1200">1200 - Inventory</SelectItem>
                  <SelectItem value="2000">2000 - Accounts Payable</SelectItem>
                  <SelectItem value="3000">3000 - Equity</SelectItem>
                  <SelectItem value="4000">4000 - Sales Revenue</SelectItem>
                  <SelectItem value="5000">5000 - Cost of Goods Sold</SelectItem>
                  <SelectItem value="6000">6000 - Operating Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Transaction description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="debit">Debit</Label>
              <Input
                id="debit"
                name="debit"
                type="number"
                placeholder="0.00"
                value={formData.debit}
                onChange={handleInputChange}
                disabled={!!formData.credit && Number(formData.credit) > 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit">Credit</Label>
              <Input
                id="credit"
                name="credit"
                type="number"
                placeholder="0.00"
                value={formData.credit}
                onChange={handleInputChange}
                disabled={!!formData.debit && Number(formData.debit) > 0}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Transaction"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
