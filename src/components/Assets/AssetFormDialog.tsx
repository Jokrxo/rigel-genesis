
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export interface Asset {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  depreciation_rate: number;
  useful_life: number;
  location: string;
  created_at: string;
}

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  purchase_date: z.string().min(1, "Purchase date is required"),
  purchase_price: z.coerce.number().min(0, "Purchase price must be positive"),
  current_value: z.coerce.number().min(0, "Current value must be positive"),
  depreciation_rate: z.coerce.number().min(0, "Depreciation rate must be positive"),
  useful_life: z.coerce.number().min(0, "Useful life must be positive"),
  location: z.string().default(""),
});

export type AssetFormData = z.infer<typeof assetSchema>;

interface AssetFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData) => void;
  editingAsset: Asset | null;
}

export const AssetFormDialog = ({
  open,
  onClose,
  onSubmit,
  editingAsset,
}: AssetFormDialogProps) => {
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      category: "",
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: 0,
      current_value: 0,
      depreciation_rate: 0,
      useful_life: 0,
      location: "",
    },
  });

  useEffect(() => {
    if (editingAsset) {
      form.reset({
        name: editingAsset.name,
        category: editingAsset.category,
        purchase_date: editingAsset.purchase_date,
        purchase_price: editingAsset.purchase_price,
        current_value: editingAsset.current_value,
        depreciation_rate: editingAsset.depreciation_rate,
        useful_life: editingAsset.useful_life,
        location: editingAsset.location,
      });
    } else {
      form.reset({
        name: "",
        category: "",
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_price: 0,
        current_value: 0,
        depreciation_rate: 0,
        useful_life: 0,
        location: "",
      });
    }
  }, [editingAsset, form]);

  const handleSubmit = (data: AssetFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAsset ? "Edit Asset" : "Add New Asset"}
          </DialogTitle>
          <DialogDescription>
            {editingAsset
              ? "Update asset information"
              : "Enter details for the new asset"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Asset Name" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Property, Vehicle, IT Equipment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Asset Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (R)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value (R)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depreciation_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depreciation Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="useful_life"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Useful Life (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAsset ? "Update Asset" : "Add Asset"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
