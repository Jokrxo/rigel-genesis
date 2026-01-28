
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const vatSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be positive"),
  vatRate: z.coerce.number().min(0, "VAT Rate must be positive"),
  calculationType: z.enum(['add', 'remove']),
});

type VATFormValues = z.infer<typeof vatSchema>;

const VATCalculator = () => {
  const [results, setResults] = useState<{ vatAmount: number; totalAmount: number } | null>(null);

  const form = useForm<VATFormValues>({
    resolver: zodResolver(vatSchema),
    defaultValues: {
      amount: 0,
      vatRate: 15,
      calculationType: 'add',
    },
  });

  const onSubmit = (data: VATFormValues) => {
    const { amount, vatRate, calculationType } = data;
    let calculatedVAT;
    let calculatedTotal;

    if (calculationType === 'add') {
      // Add VAT to amount (amount is exclusive)
      calculatedVAT = (amount * vatRate) / 100;
      calculatedTotal = amount + calculatedVAT;
    } else {
      // Remove VAT from amount (amount is inclusive)
      calculatedVAT = (amount * vatRate) / (100 + vatRate);
      calculatedTotal = amount - calculatedVAT;
    }

    setResults({
      vatAmount: calculatedVAT,
      totalAmount: calculatedTotal,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>VAT Calculator</CardTitle>
        <CardDescription>Calculate VAT on amounts (South African VAT rate: 15%)</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (R)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vatRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="calculationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calculation Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select calculation type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="add">Add VAT (Amount is VAT exclusive)</SelectItem>
                      <SelectItem value="remove">Remove VAT (Amount is VAT inclusive)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Calculate VAT</Button>
          </form>
        </Form>

        {results && (
          <div className="mt-6 grid gap-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <Label>VAT Amount:</Label>
              <span className="font-semibold">R {results.vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <Label>{form.getValues('calculationType') === 'add' ? 'Total (VAT Inclusive):' : 'Net Amount (VAT Exclusive):'}</Label>
              <span className="font-semibold">R {results.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VATCalculator;
