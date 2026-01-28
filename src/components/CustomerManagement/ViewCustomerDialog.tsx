
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  vat_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  payment_terms?: number;
  credit_limit?: number;
  notes?: string;
  created_at: string;
}

interface ViewCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const ViewCustomerDialog = ({
  open,
  onClose,
  customer,
}: ViewCustomerDialogProps) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Viewing details for {customer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Name</Label>
                  <div className="col-span-2 font-medium">{customer.name}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Company</Label>
                  <div className="col-span-2">{customer.company || "-"}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="col-span-2">{customer.email || "-"}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Phone</Label>
                  <div className="col-span-2">{customer.phone || "-"}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">VAT Number</Label>
                  <div className="col-span-2">{customer.vat_number || "-"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Financial Details</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Payment Terms</Label>
                  <div className="col-span-2">
                    {customer.payment_terms ? `${customer.payment_terms} days` : "30 days"}
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Credit Limit</Label>
                  <div className="col-span-2">
                    {customer.credit_limit
                      ? `R${customer.credit_limit.toLocaleString()}`
                      : "R0.00"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Address</h3>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Address Line 1</Label>
                <div className="col-span-2">{customer.address_line1 || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Address Line 2</Label>
                <div className="col-span-2">{customer.address_line2 || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">City</Label>
                <div className="col-span-2">{customer.city || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Province</Label>
                <div className="col-span-2">{customer.province || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Postal Code</Label>
                <div className="col-span-2">{customer.postal_code || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Country</Label>
                <div className="col-span-2">{customer.country || "-"}</div>
              </div>
            </div>
          </div>

          {customer.notes && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Notes</h3>
                <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                  {customer.notes}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
