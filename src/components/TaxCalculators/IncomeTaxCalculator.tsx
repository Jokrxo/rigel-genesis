
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const incomeTaxSchema = z.object({
  annualIncome: z.coerce.number({ invalid_type_error: "Income must be a number" }).min(0, "Income cannot be negative"),
  taxYear: z.enum(["2024", "2025", "2026"]),
  ageGroup: z.enum(["under65", "65to74", "75plus"]),
  entityType: z.enum(["individual", "company"])
});

type IncomeTaxFormValues = z.infer<typeof incomeTaxSchema>;

const IncomeTaxCalculator = () => {
  const { toast } = useToast();
  const [results, setResults] = useState<{ tax: number; netIncome: number } | null>(null);

  const form = useForm<IncomeTaxFormValues>({
    resolver: zodResolver(incomeTaxSchema),
    defaultValues: {
      annualIncome: 0,
      taxYear: '2026',
      ageGroup: 'under65',
      entityType: 'individual',
    },
  });

  // South African tax brackets
  const taxBrackets = {
    '2024': [
      { min: 0, max: 237100, rate: 0.18, threshold: 0 },
      { min: 237101, max: 370500, rate: 0.26, threshold: 42678 },
      { min: 370501, max: 512800, rate: 0.31, threshold: 77362 },
      { min: 512801, max: 673000, rate: 0.36, threshold: 121475 },
      { min: 673001, max: 857900, rate: 0.39, threshold: 179147 },
      { min: 857901, max: 1817000, rate: 0.41, threshold: 251258 },
      { min: 1817001, max: Infinity, rate: 0.45, threshold: 644489 }
    ],
    '2025': [
      { min: 0, max: 237100, rate: 0.18, threshold: 0 },
      { min: 237101, max: 370500, rate: 0.26, threshold: 42678 },
      { min: 370501, max: 512800, rate: 0.31, threshold: 77362 },
      { min: 512801, max: 673000, rate: 0.36, threshold: 121475 },
      { min: 673001, max: 857900, rate: 0.39, threshold: 179147 },
      { min: 857901, max: 1817000, rate: 0.41, threshold: 251258 },
      { min: 1817001, max: Infinity, rate: 0.45, threshold: 644489 }
    ],
    '2026': [
      { min: 0, max: 237100, rate: 0.18, threshold: 0 },
      { min: 237101, max: 370500, rate: 0.26, threshold: 42678 },
      { min: 370501, max: 512800, rate: 0.31, threshold: 77362 },
      { min: 512801, max: 673000, rate: 0.36, threshold: 121475 },
      { min: 673001, max: 857900, rate: 0.39, threshold: 179147 },
      { min: 857901, max: 1817000, rate: 0.41, threshold: 251258 },
      { min: 1817001, max: Infinity, rate: 0.45, threshold: 644489 }
    ]
  };

  // Tax rebates
  const rebates = {
    '2024': { primary: 17235, secondary: 9444, tertiary: 3145 },
    '2025': { primary: 17235, secondary: 9444, tertiary: 3145 },
    '2026': { primary: 17235, secondary: 9444, tertiary: 3145 }
  };

  const COMPANY_TAX_RATE = 0.27; // 27%

  const onSubmit = (data: IncomeTaxFormValues) => {
    let finalTax = 0;

    if (data.entityType === 'company') {
      finalTax = data.annualIncome * COMPANY_TAX_RATE;
    } else {
      const brackets = taxBrackets[data.taxYear as keyof typeof taxBrackets];
      const currentRebates = rebates[data.taxYear as keyof typeof rebates];
      let tax = 0;
      const income = data.annualIncome;

      const bracket = brackets.find(b => income >= b.min && income <= b.max);
      
      if (bracket) {
        if (bracket.min === 0) {
          tax = income * bracket.rate;
        } else {
          // Calculate amount above the previous bracket limit
          // The bracket.min is the start of the range (e.g., 237101)
          // The previous limit was 237100 (which is bracket.min - 1)
          tax = bracket.threshold + (income - (bracket.min - 1)) * bracket.rate;
        }
      }

      let totalRebate = currentRebates.primary;
      if (data.ageGroup === '65to74') {
        totalRebate += currentRebates.secondary;
      } else if (data.ageGroup === '75plus') {
        totalRebate += currentRebates.secondary + currentRebates.tertiary;
      }

      finalTax = Math.max(0, tax - totalRebate);
    }

    setResults({
      tax: finalTax,
      netIncome: data.annualIncome - finalTax
    });
    
    toast({
      title: "Calculation Complete",
      description: `Estimated Tax: R${finalTax.toFixed(2)}`,
    });
  };

  const entityType = form.watch('entityType');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Income Tax Calculator</CardTitle>
        <CardDescription>Calculate South African income tax ({form.watch('taxYear')} tax year)</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="entityType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Entity Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="individual" />
                        </FormControl>
                        <FormLabel className="font-normal">Individual</FormLabel>
                      </div>
                      <div className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="company" />
                        </FormControl>
                        <FormLabel className="font-normal">Company (27%)</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="annualIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Taxable Income (R)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2026">2026 (Mar 2025 - Feb 2026)</SelectItem>
                        <SelectItem value="2025">2025 (Mar 2024 - Feb 2025)</SelectItem>
                        <SelectItem value="2024">2024 (Mar 2023 - Feb 2024)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {entityType === 'individual' && (
              <FormField
                control={form.control}
                name="ageGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under65">Under 65</SelectItem>
                        <SelectItem value="65to74">65 - 74</SelectItem>
                        <SelectItem value="75plus">75 and older</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full">Calculate Tax</Button>
          </form>
        </Form>

        {results && (
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Annual Tax:</span>
                <span className="text-xl font-bold text-primary">R {results.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Monthly Tax:</span>
                <span>R {(results.tax / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-border my-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Net Annual Income:</span>
                  <span className="font-bold">R {results.netIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Net Monthly Income:</span>
                  <span>R {(results.netIncome / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeTaxCalculator;
