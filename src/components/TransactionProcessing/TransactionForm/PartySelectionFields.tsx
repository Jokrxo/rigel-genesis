import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import React from "react";

import { UseFormReturn } from "react-hook-form";
import { TransactionFormValues } from "./TransactionFormMain";

interface PartySelectionFieldsProps {
  form: UseFormReturn<TransactionFormValues>;
  customers: { id: string; name: string; company: string }[];
  suppliers: { id: string; name: string; company: string }[];
  watchedPartyType: string | undefined;
}

const partyTypes = [
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
  { value: "employee", label: "Employee" },
  { value: "director", label: "Director" },
  { value: "internal", label: "Internal" },
];

export function PartySelectionFields({
  form,
  customers,
  suppliers,
  watchedPartyType,
}: PartySelectionFieldsProps) {
  function getPartyOptions() {
    switch (watchedPartyType) {
      case "customer":
        return customers.map((customer) => ({
          value: customer.id,
          label: customer.company || customer.name,
        }));
      case "supplier":
        return suppliers.map((supplier) => ({
          value: supplier.id,
          label: supplier.company || supplier.name,
        }));
      default:
        return [];
    }
  }
  return (
    <>
      <FormField
        control={form.control}
        name="party_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Party Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select party type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {partyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {(watchedPartyType === "customer" || watchedPartyType === "supplier") && (
        <FormField
          control={form.control}
          name="party_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {watchedPartyType === "customer" ? "Customer" : "Supplier"}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${watchedPartyType}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getPartyOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={form.control}
        name="reference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reference</FormLabel>
            <FormControl>
              <Input placeholder="Reference number or code" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input placeholder="Transaction description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
