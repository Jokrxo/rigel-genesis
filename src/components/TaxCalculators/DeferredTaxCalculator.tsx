
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DeferredTaxCalculator = () => {
  const [bookValue, setBookValue] = useState<number | null>(null);
  const [taxValue, setTaxValue] = useState<number | null>(null);
  const [taxRate, setTaxRate] = useState<number>(28); // SA corporate tax rate
  const [differenceType, setDifferenceType] = useState<'temporary' | 'permanent'>('temporary');
  const [deferredTaxAsset, setDeferredTaxAsset] = useState<number | null>(null);
  const [deferredTaxLiability, setDeferredTaxLiability] = useState<number | null>(null);

  const calculateDeferredTax = () => {
    if (bookValue === null || taxValue === null) {
      alert("Please enter both book value and tax value.");
      return;
    }

    if (differenceType === 'permanent') {
      setDeferredTaxAsset(0);
      setDeferredTaxLiability(0);
      return;
    }

    const temporaryDifference = bookValue - taxValue;
    const deferredTaxAmount = Math.abs(temporaryDifference * (taxRate / 100));

    if (temporaryDifference > 0) {
      // Deferred Tax Liability (Book > Tax)
      setDeferredTaxLiability(deferredTaxAmount);
      setDeferredTaxAsset(0);
    } else if (temporaryDifference < 0) {
      // Deferred Tax Asset (Tax > Book)
      setDeferredTaxAsset(deferredTaxAmount);
      setDeferredTaxLiability(0);
    } else {
      // No difference
      setDeferredTaxAsset(0);
      setDeferredTaxLiability(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deferred Tax Calculator</CardTitle>
        <CardDescription>Calculate deferred tax assets and liabilities from temporary differences</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bookValue">Book Value (R)</Label>
          <Input
            type="number"
            id="bookValue"
            placeholder="Enter book value"
            onChange={(e) => setBookValue(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="taxValue">Tax Value (R)</Label>
          <Input
            type="number"
            id="taxValue"
            placeholder="Enter tax value"
            onChange={(e) => setTaxValue(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            type="number"
            id="taxRate"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value ? parseFloat(e.target.value) : 28)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="differenceType">Difference Type</Label>
          <Select onValueChange={(value) => setDifferenceType(value as 'temporary' | 'permanent')}>
            <SelectTrigger id="differenceType">
              <SelectValue placeholder="Select difference type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temporary">Temporary Difference</SelectItem>
              <SelectItem value="permanent">Permanent Difference</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={calculateDeferredTax}>Calculate Deferred Tax</Button>
        {(deferredTaxAsset !== null || deferredTaxLiability !== null) && (
          <div className="grid gap-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <Label>Book Value:</Label>
              <span className="font-semibold">R {bookValue?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <Label>Tax Value:</Label>
              <span className="font-semibold">R {taxValue?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <Label>Temporary Difference:</Label>
              <span className="font-semibold">R {((bookValue || 0) - (taxValue || 0)).toLocaleString()}</span>
            </div>
            {deferredTaxAsset! > 0 && (
              <div className="flex justify-between">
                <Label>Deferred Tax Asset:</Label>
                <span className="font-semibold text-green-600">R {deferredTaxAsset.toLocaleString()}</span>
              </div>
            )}
            {deferredTaxLiability! > 0 && (
              <div className="flex justify-between">
                <Label>Deferred Tax Liability:</Label>
                <span className="font-semibold text-red-600">R {deferredTaxLiability.toLocaleString()}</span>
              </div>
            )}
            {differenceType === 'permanent' && (
              <div className="text-sm text-muted-foreground p-2 bg-warning/10 rounded border border-warning/20">
                <strong>Note:</strong> Permanent differences do not create deferred tax assets or liabilities.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeferredTaxCalculator;
