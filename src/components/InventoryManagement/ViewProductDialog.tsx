
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

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  unit_price: number;
  cost_price?: number;
  quantity_on_hand?: number;
  reorder_level?: number;
  unit_of_measure?: string;
  is_active?: boolean;
  tax_rate?: number;
  created_at: string;
}

interface ViewProductDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ViewProductDialog = ({
  open,
  onClose,
  product,
}: ViewProductDialogProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            Viewing details for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">General Information</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Product Name</Label>
                  <div className="col-span-2 font-medium">{product.name}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">SKU</Label>
                  <div className="col-span-2 font-mono">{product.sku || "-"}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Category</Label>
                  <div className="col-span-2">{product.category || "-"}</div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="col-span-2">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Pricing & Tax</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Unit Price</Label>
                  <div className="col-span-2">
                    R{product.unit_price.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Cost Price</Label>
                  <div className="col-span-2">
                    {product.cost_price ? `R${product.cost_price.toFixed(2)}` : "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="text-muted-foreground">Tax Rate</Label>
                  <div className="col-span-2">
                    {product.tax_rate ? `${product.tax_rate}%` : "0%"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Inventory</h3>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Quantity on Hand</Label>
                <div className="col-span-2">
                  {product.quantity_on_hand || 0} {product.unit_of_measure || "units"}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Reorder Level</Label>
                <div className="col-span-2">{product.reorder_level || 0}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="text-muted-foreground">Unit of Measure</Label>
                <div className="col-span-2">{product.unit_of_measure || "-"}</div>
              </div>
            </div>
          </div>

          {product.description && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Description</h3>
                <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                  {product.description}
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
