
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

const depreciationSchema = z.object({
  assetCost: z.coerce.number().min(0, "Asset cost must be positive"),
  salvageValue: z.coerce.number().min(0, "Salvage value must be positive"),
  usefulLife: z.coerce.number().min(1, "Useful life must be at least 1 year"),
  depreciationMethod: z.enum(['straight-line', 'declining-balance', 'sum-of-years']),
}).refine((data) => data.salvageValue <= data.assetCost, {
  message: "Salvage value cannot be greater than asset cost",
  path: ["salvageValue"],
});

type DepreciationFormValues = z.infer<typeof depreciationSchema>;

const DepreciationCalculator = () => {
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  const form = useForm<DepreciationFormValues>({
    resolver: zodResolver(depreciationSchema),
    defaultValues: {
      assetCost: 0,
      salvageValue: 0,
      usefulLife: 5,
      depreciationMethod: 'straight-line',
    },
  });

  const onSubmit = (data: DepreciationFormValues) => {
    const { assetCost, salvageValue, usefulLife, depreciationMethod } = data;
    let depreciation = 0;
    let rate;
    let sum;

    switch (depreciationMethod) {
      case 'straight-line':
        depreciation = (assetCost - salvageValue) / usefulLife;
        break;
      case 'declining-balance':
        rate = 1 / usefulLife;
        depreciation = (assetCost - salvageValue) * rate;
        break;
      case 'sum-of-years':
        sum = 0;
        for (let i = 1; i <= usefulLife; i++) {
          sum += i;
        }
        depreciation = ((assetCost - salvageValue) * usefulLife) / sum;
        break;
    }

    setCalculatedValue(depreciation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Depreciation Calculator</CardTitle>
        <CardDescription>Calculate the depreciation of an asset.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assetCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Cost</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter asset cost" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salvageValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salvage Value</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter salvage value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="usefulLife"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Useful Life (Years)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter useful life" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="depreciationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciation Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="straight-line">Straight Line</SelectItem>
                      <SelectItem value="declining-balance">Declining Balance</SelectItem>
                      <SelectItem value="sum-of-years">Sum of Years</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Calculate Depreciation</Button>
          </form>
        </Form>
        
        {calculatedValue !== null && (
          <div className="mt-6 grid gap-2">
            <FormLabel>Calculated Depreciation (First Year)</FormLabel>
            <Input value={calculatedValue.toFixed(2)} readOnly />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepreciationCalculator;
