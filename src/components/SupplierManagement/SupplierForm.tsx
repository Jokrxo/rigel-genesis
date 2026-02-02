
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SupplierFormFields } from "./SupplierFormFields";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  vat_number: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("South Africa"),
  payment_terms: z.coerce.number().min(0, "Payment terms must be positive"),
  credit_limit: z.coerce.number().min(0, "Credit limit must be positive"),
  status: z.string().default("active"),
  notes: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

export interface Supplier {
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
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSupplier?: Supplier | null;
}

export const SupplierForm = ({ open, onClose, onSuccess, editingSupplier }: SupplierFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      vat_number: "",
      address_line1: "",
      address_line2: "",
      city: "",
      province: "",
      postal_code: "",
      country: "South Africa",
      payment_terms: 30,
      credit_limit: 0,
      status: "active",
      notes: "",
    },
  });

  useEffect(() => {
    if (editingSupplier) {
      form.reset({
        name: editingSupplier.name,
        email: editingSupplier.email || "",
        phone: editingSupplier.phone || "",
        company: editingSupplier.company || "",
        vat_number: editingSupplier.vat_number || "",
        address_line1: editingSupplier.address_line1 || "",
        address_line2: editingSupplier.address_line2 || "",
        city: editingSupplier.city || "",
        province: editingSupplier.province || "",
        postal_code: editingSupplier.postal_code || "",
        country: editingSupplier.country || "South Africa",
        payment_terms: editingSupplier.payment_terms || 30,
        credit_limit: editingSupplier.credit_limit || 0,
        status: editingSupplier.status,
        notes: editingSupplier.notes || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        vat_number: "",
        address_line1: "",
        address_line2: "",
        city: "",
        province: "",
        postal_code: "",
        country: "South Africa",
        payment_terms: 30,
        credit_limit: 0,
        status: "active",
        notes: "",
      });
    }
  }, [editingSupplier, form]);

  const onSubmit = async (data: SupplierFormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingSupplier) {
        const { error } = await (supabase
          .from("suppliers") as any)
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSupplier.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Supplier updated successfully",
        });
      } else {
        const { error } = await (supabase
          .from("suppliers") as any)
          .insert([{
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            company: data.company || null,
            vat_number: data.vat_number || null,
            address_line1: data.address_line1 || null,
            address_line2: data.address_line2 || null,
            city: data.city || null,
            province: data.province || null,
            postal_code: data.postal_code || null,
            country: data.country || "South Africa",
            payment_terms: data.payment_terms,
            credit_limit: data.credit_limit,
            status: data.status || "active",
            notes: data.notes || null,
            user_id: user.id,
          }]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Supplier created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast({
        title: "Error",
        description: "Failed to save supplier",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
          <DialogDescription>
            {editingSupplier 
              ? "Update supplier information" 
              : "Enter supplier details to add them to your database"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SupplierFormFields control={form.control} />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingSupplier ? "Update Supplier" : "Create Supplier"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
