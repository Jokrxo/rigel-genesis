
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DeferredTaxCategory, CategoryType } from '../types';

const categorySchema = z.object({
  description: z.string().min(1, "Description is required"),
  category_type: z.enum(['temporary_taxable', 'temporary_deductible', 'initial_recognition', 'uncertain_positions']),
  entity_name: z.string().optional(),
  book_value: z.coerce.number(),
  tax_value: z.coerce.number(),
  applicable_tax_rate: z.coerce.number().min(0).max(1, "Rate must be between 0 and 1"),
  recognition_criteria_met: z.boolean().default(true),
  notes: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<DeferredTaxCategory, 'id' | 'created_at' | 'updated_at' | 'project_id'>) => Promise<void>;
  defaultTaxRate?: number;
  isMultiEntity?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  defaultTaxRate = 0.27,
  isMultiEntity = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      description: '',
      category_type: 'temporary_taxable',
      book_value: 0,
      tax_value: 0,
      applicable_tax_rate: defaultTaxRate,
      recognition_criteria_met: true,
      entity_name: '',
      notes: '',
    },
  });

  // Auto-calculate type and difference
  const bookValue = form.watch('book_value');
  const taxValue = form.watch('tax_value');
  const rate = form.watch('applicable_tax_rate');

  useEffect(() => {
    // Simple heuristic: if Book > Tax, typically Taxable (Liability). If Book < Tax, Deductible (Asset).
    // This depends on whether it's an Asset or Liability in the books, but we don't ask that.
    // We'll just let the user override if needed, but we can update the difference.
  }, [bookValue, taxValue]);

  const handleSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      const tempDiff = values.book_value - values.tax_value;
      
      // Calculate DTA/DTL
      // If type is taxable -> DTL. If deductible -> DTA.
      let dta = 0;
      let dtl = 0;

      if (values.recognition_criteria_met) {
        if (values.category_type === 'temporary_taxable') {
            dtl = Math.abs(tempDiff) * values.applicable_tax_rate;
        } else if (values.category_type === 'temporary_deductible') {
            dta = Math.abs(tempDiff) * values.applicable_tax_rate;
        }
      }

      await onSubmit({
        ...values,
        temporary_difference: tempDiff,
        deferred_tax_asset: dta,
        deferred_tax_liability: dtl,
      } as any);
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Deferred Tax Category</DialogTitle>
          <DialogDescription>
            Add a new temporary difference category.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              {isMultiEntity && (
                <FormField
                  control={form.control}
                  name="entity_name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                      <FormLabel className="text-right">Entity</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">Description</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_type"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">Type</FormLabel>
                    <div className="col-span-3">
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="temporary_taxable">Temporary Taxable</SelectItem>
                          <SelectItem value="temporary_deductible">Temporary Deductible</SelectItem>
                          <SelectItem value="initial_recognition">Initial Recognition</SelectItem>
                          <SelectItem value="uncertain_positions">Uncertain Position</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="book_value"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">Book Value</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_value"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">Tax Base</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicable_tax_rate"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">Tax Rate</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recognition_criteria_met"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <div className="col-start-2 col-span-3 flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal m-0">Recognition criteria met?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>Save Category</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
