
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Asset } from "./AssetFormDialog";

interface ViewAssetDialogProps {
  open: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const ViewAssetDialog = ({
  open,
  onClose,
  asset,
}: ViewAssetDialogProps) => {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asset Details</DialogTitle>
          <DialogDescription>
            Detailed information about {asset.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Asset Name</Label>
              <div className="font-medium text-lg">{asset.name}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <div className="font-medium">{asset.category || "-"}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Purchase Date</Label>
              <div className="font-medium">{new Date(asset.purchase_date).toLocaleDateString()}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Location</Label>
              <div className="font-medium">{asset.location || "-"}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Purchase Price</Label>
              <div className="font-medium">R{asset.purchase_price.toFixed(2)}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Current Value</Label>
              <div className="font-medium text-lg text-primary">R{asset.current_value.toFixed(2)}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Depreciation Rate</Label>
              <div className="font-medium">{asset.depreciation_rate}% p.a.</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Useful Life</Label>
              <div className="font-medium">{asset.useful_life} years</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
