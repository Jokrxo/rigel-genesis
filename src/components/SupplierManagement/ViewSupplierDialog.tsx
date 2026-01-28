
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
import { Badge } from "@/components/ui/badge";
import { Supplier } from "./SupplierForm";

interface ViewSupplierDialogProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

export const ViewSupplierDialog = ({
  open,
  onClose,
  supplier,
}: ViewSupplierDialogProps) => {
  if (!supplier) return null;

  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusColors = {
      active: "default" as const,
      inactive: "secondary" as const,
      blocked: "destructive" as const,
    };
    return statusColors[status as keyof typeof statusColors] || "default";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Supplier Details</DialogTitle>
          <DialogDescription>
            Viewing details for {supplier.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Name</Label>
                  <div className="col-span-2 font-medium">{supplier.name}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Company</Label>
                  <div className="col-span-2">{supplier.company || "-"}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="col-span-2">{supplier.email || "-"}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Phone</Label>
                  <div className="col-span-2">{supplier.phone || "-"}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">VAT Number</Label>
                  <div className="col-span-2">{supplier.vat_number || "-"}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="col-span-2">
                    <Badge variant={getStatusBadge(supplier.status)}>
                      {supplier.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Financial Details</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Payment Terms</Label>
                  <div className="col-span-2">
                    {supplier.payment_terms ? `${supplier.payment_terms} days` : "30 days"}
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Credit Limit</Label>
                  <div className="col-span-2">
                    {supplier.credit_limit
                      ? `R${supplier.credit_limit.toLocaleString()}`
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
                <div className="col-span-2">{supplier.address_line1 || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Address Line 2</Label>
                <div className="col-span-2">{supplier.address_line2 || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">City</Label>
                <div className="col-span-2">{supplier.city || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Province</Label>
                <div className="col-span-2">{supplier.province || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Postal Code</Label>
                <div className="col-span-2">{supplier.postal_code || "-"}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Country</Label>
                <div className="col-span-2">{supplier.country || "-"}</div>
              </div>
            </div>
          </div>

          {supplier.notes && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Notes</h3>
                <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                  {supplier.notes}
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
