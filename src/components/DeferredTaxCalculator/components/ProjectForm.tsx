import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { Country, DeferredTaxProject } from '../types';

interface ProjectFormProps {
  countries: Country[];
  onSubmit: (projectData: Omit<DeferredTaxProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: Partial<DeferredTaxProject>;
  isEditing?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  countries,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    country_id: initialData?.country_id || '',
    tax_year: initialData?.tax_year || new Date().getFullYear(),
    reporting_currency: initialData?.reporting_currency || 'ZAR',
    multi_entity: initialData?.multi_entity || false,
    status: initialData?.status || 'draft' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.country_id) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., ABC Company - 2024 Deferred Tax"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="country">Country/Jurisdiction *</Label>
              <Select 
                value={formData.country_id} 
                onValueChange={(value) => setFormData({ ...formData, country_id: value })}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name} ({country.corporate_tax_rate}% tax rate)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tax_year">Tax Year</Label>
                <Select 
                  value={formData.tax_year.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, tax_year: parseInt(value) })}
                >
                  <SelectTrigger id="tax_year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Reporting Currency</Label>
                <Select 
                  value={formData.reporting_currency} 
                  onValueChange={(value) => setFormData({ ...formData, reporting_currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="multi_entity">Multi-Entity Reporting</Label>
                <p className="text-sm text-muted-foreground">
                  Enable if you need to track deferred tax for multiple entities
                </p>
              </div>
              <Switch
                id="multi_entity"
                checked={formData.multi_entity}
                onCheckedChange={(checked) => setFormData({ ...formData, multi_entity: checked })}
              />
            </div>

            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'draft' | 'final' | 'archived') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {isEditing ? 'Update Project' : 'Create Project'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};