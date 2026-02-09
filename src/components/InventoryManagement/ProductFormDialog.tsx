
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
  type?: string;
  created_at: string;
}

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  sku: z.string().default(""),
  category: z.string().default(""),
  unit_price: z.coerce.number().min(0, "Unit price must be positive"),
  cost_price: z.coerce.number().min(0, "Cost price must be positive").default(0),
  quantity_on_hand: z.coerce.number().min(0, "Quantity must be positive").default(0),
  reorder_level: z.coerce.number().min(0, "Reorder level must be positive").default(0),
  unit_of_measure: z.string().default("units"),
  is_active: z.boolean().default(true),
  tax_rate: z.coerce.number().min(0).default(15),
  type: z.enum(['inventory', 'service']).default('inventory'),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  editingProduct: Product | null;
}

export const ProductFormDialog = ({
  open,
  onClose,
  onSubmit,
  editingProduct,
}: ProductFormDialogProps) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      category: "",
      unit_price: 0,
      cost_price: 0,
      quantity_on_hand: 0,
      reorder_level: 0,
      unit_of_measure: "units",
      is_active: true,
      tax_rate: 15,
      type: "inventory",
    },
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description || "",
        sku: editingProduct.sku || "",
        category: editingProduct.category || "",
        unit_price: editingProduct.unit_price,
        cost_price: editingProduct.cost_price || 0,
        quantity_on_hand: editingProduct.quantity_on_hand || 0,
        reorder_level: editingProduct.reorder_level || 0,
        unit_of_measure: editingProduct.unit_of_measure || "units",
        is_active: editingProduct.is_active ?? true,
        tax_rate: editingProduct.tax_rate ?? 15,
        type: (editingProduct.type || "inventory") as "inventory" | "service",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        sku: "",
        category: "",
        unit_price: 0,
        cost_price: 0,
        quantity_on_hand: 0,
        reorder_level: 0,
        unit_of_measure: "units",
        is_active: true,
        tax_rate: 15,
        type: "inventory",
      });
    }
  }, [editingProduct, form]);

  const watchType = form.watch("type");

  const handleSubmit = (data: ProductFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? "Update product information"
              : "Enter product details to add to inventory"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <Input 
                                type="radio" 
                                id="type-inventory" 
                                className="w-4 h-4" 
                                checked={field.value === 'inventory'} 
                                onChange={() => field.onChange('inventory')}
                            />
                            <Label htmlFor="type-inventory">Inventory (Track Stock)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Input 
                                type="radio" 
                                id="type-service" 
                                className="w-4 h-4" 
                                checked={field.value === 'service'} 
                                onChange={() => field.onChange('service')}
                            />
                            <Label htmlFor="type-service">Service</Label>
                        </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product Name" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Product Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_of_measure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. units, kg, liters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (R)</FormLabel>
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
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (R)</FormLabel>
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

              {watchType === 'inventory' && (
              <>
              <FormField
                control={form.control}
                name="quantity_on_hand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity On Hand</FormLabel>
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
              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level</FormLabel>
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
              </>
              )}

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
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
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Product is available for transactions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
