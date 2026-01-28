
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TaxLossCarryForward, LossType } from '../types';

const lossSchema = z.object({
  loss_type: z.enum(['assessed_loss', 'capital_loss', 'other']),
  entity_name: z.string().optional(),
  loss_amount: z.coerce.number().min(0, "Amount must be positive"),
  origination_year: z.coerce.number().int().min(1900).max(2100),
  expiry_year: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal('')),
  utilization_probability: z.coerce.number().min(0).max(100, "Probability must be between 0 and 100"),
  deferred_tax_asset: z.coerce.number().min(0),
  notes: z.string().optional(),
});

type LossFormValues = z.infer<typeof lossSchema>;

interface TaxLossFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<TaxLossCarryForward, 'id' | 'created_at' | 'updated_at' | 'project_id'>) => Promise<void>;
  defaultTaxRate?: number;
  isMultiEntity?: boolean;
}

export const TaxLossForm: React.FC<TaxLossFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  defaultTaxRate = 0.27,
  isMultiEntity = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LossFormValues>({
    resolver: zodResolver(lossSchema),
    defaultValues: {
      loss_type: 'assessed_loss',
      loss_amount: 0,
      origination_year: new Date().getFullYear(),
      utilization_probability: 100,
      deferred_tax_asset: 0,
      entity_name: '',
      notes: '',
    },
  });

  // Auto-calculate DTA
  const amount = form.watch('loss_amount');
  const prob = form.watch('utilization_probability');
  
  React.useEffect(() => {
    // DTA = Loss * Rate * Probability
    // Only if probability is high enough? IAS 12 says probable.
    const calculated = amount * defaultTaxRate * (prob / 100);
    form.setValue('deferred_tax_asset', parseFloat(calculated.toFixed(2)));
  }, [amount, prob, defaultTaxRate, form]);

  const handleSubmit = async (values: LossFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        expiry_year: values.expiry_year === '' ? undefined : Number(values.expiry_year),
        utilization_probability: values.utilization_probability / 100, // Convert back to decimal
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
          <DialogTitle>Add Tax Loss</DialogTitle>
          <DialogDescription>
            Record a tax loss carry forward.
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
                name="loss_type"
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
                          <SelectItem value="assessed_loss">Assessed Loss</SelectItem>
                          <SelectItem value="capital_loss">Capital Loss</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loss_amount"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">Loss Amount</FormLabel>
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
                name="origination_year"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">Origination Year</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_year"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">Expiry Year</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="number" placeholder="Optional" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utilization_probability"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">Probability (%)</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deferred_tax_asset"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                    <FormLabel className="text-right">DT Asset</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Calculated as Loss × {defaultTaxRate * 100}% × Probability
                      </p>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>Save Tax Loss</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
