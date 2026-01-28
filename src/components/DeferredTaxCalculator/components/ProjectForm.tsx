
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Country, DeferredTaxProject } from '../types';

interface ProjectFormProps {
  countries: Country[];
  onSubmit: (projectData: Omit<DeferredTaxProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: Partial<DeferredTaxProject>;
  isEditing?: boolean;
}

const projectSchema = z.object({
  name: z.string().min(1, "Project Name is required"),
  country_id: z.string().min(1, "Country is required"),
  tax_year: z.coerce.number().int().min(2000).max(2100),
  reporting_currency: z.string().min(1, "Currency is required"),
  multi_entity: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'archived'] as const).default('draft'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export const ProjectForm: React.FC<ProjectFormProps> = ({
  countries,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || '',
      country_id: initialData?.country_id || '',
      tax_year: initialData?.tax_year || new Date().getFullYear(),
      reporting_currency: initialData?.reporting_currency || 'ZAR',
      multi_entity: initialData?.multi_entity || false,
      status: (initialData?.status === 'active' || initialData?.status === 'archived' || initialData?.status === 'draft') 
        ? initialData.status 
        : 'draft',
    },
  });

  const handleSubmit = (data: ProjectFormValues) => {
    onSubmit({
      name: data.name,
      country_id: data.country_id,
      tax_year: data.tax_year,
      reporting_currency: data.reporting_currency,
      multi_entity: data.multi_entity,
      status: data.status,
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const currencies = [
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </h2>
        <p className="text-muted-foreground">
          {isEditing ? 'Update project details' : 'Set up your deferred tax calculation project'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Configure your deferred tax project settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ABC Company - 2024 Deferred Tax" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country/Jurisdiction *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name} - {country.corporate_tax_rate * 100}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="tax_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Year *</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(parseInt(val))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tax year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
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
                  name="reporting_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Currency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="multi_entity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Multi-Entity Project</FormLabel>
                      <FormDescription>
                        Enable if this project involves multiple legal entities or business units.
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
