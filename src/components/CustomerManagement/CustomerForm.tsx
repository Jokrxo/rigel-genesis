
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const customerSchema = z.object({
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
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

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

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCustomer?: Customer | null;
}

const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
];

export const CustomerForm = ({ open, onClose, onSuccess, editingCustomer }: CustomerFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      vat_number: "",
      address_line1: "",
      address_line2: "",
      city: "",
      province: "Gauteng",
      postal_code: "",
      country: "South Africa",
      payment_terms: 30,
      credit_limit: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (editingCustomer) {
      form.reset({
        name: editingCustomer.name,
        email: editingCustomer.email || "",
        phone: editingCustomer.phone || "",
        company: editingCustomer.company || "",
        vat_number: editingCustomer.vat_number || "",
        address_line1: editingCustomer.address_line1 || "",
        address_line2: editingCustomer.address_line2 || "",
        city: editingCustomer.city || "",
        province: editingCustomer.province || "Gauteng",
        postal_code: editingCustomer.postal_code || "",
        country: editingCustomer.country || "South Africa",
        payment_terms: editingCustomer.payment_terms || 30,
        credit_limit: editingCustomer.credit_limit || 0,
        notes: editingCustomer.notes || "",
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
        province: "Gauteng",
        postal_code: "",
        country: "South Africa",
        payment_terms: 30,
        credit_limit: 0,
        notes: "",
      });
    }
  }, [editingCustomer, form]);

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingCustomer) {
        const { error } = await (supabase
          .from('customers') as any)
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCustomer.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        const { error } = await (supabase
          .from('customers') as any)
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
            notes: data.notes || null,
            user_id: user.id,
          }]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Customer created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: "Failed to save customer",
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
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
          <DialogDescription>
            {editingCustomer 
              ? "Update customer information" 
              : "Enter customer details to add them to your database"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+27 11 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vat_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Number</FormLabel>
                    <FormControl>
                      <Input placeholder="VAT123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="address_line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_line2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Apartment, suite, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payment_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms (days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credit_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Limit (R)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes about the customer" {...field} />
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
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingCustomer ? "Update Customer" : "Create Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
