
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VATCalculator = () => {
  const [amount, setAmount] = useState<number | null>(null);
  const [vatRate, setVatRate] = useState<number>(15); // Default SA VAT rate
  const [calculationType, setCalculationType] = useState<'add' | 'remove'>('add');
  const [vatAmount, setVatAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  const calculateVAT = () => {
    if (amount === null) {
      alert("Please enter an amount.");
      return;
    }

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

    setVatAmount(calculatedVAT);
    setTotalAmount(calculatedTotal);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>VAT Calculator</CardTitle>
        <CardDescription>Calculate VAT on amounts (South African VAT rate: 15%)</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount (R)</Label>
          <Input
            type="number"
            id="amount"
            placeholder="Enter amount"
            onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="vatRate">VAT Rate (%)</Label>
          <Input
            type="number"
            id="vatRate"
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value ? parseFloat(e.target.value) : 15)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="calculationType">Calculation Type</Label>
          <Select onValueChange={(value) => setCalculationType(value as 'add' | 'remove')}>
            <SelectTrigger id="calculationType">
              <SelectValue placeholder="Select calculation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add">Add VAT (Amount is VAT exclusive)</SelectItem>
              <SelectItem value="remove">Remove VAT (Amount is VAT inclusive)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={calculateVAT}>Calculate VAT</Button>
        {vatAmount !== null && totalAmount !== null && (
          <div className="grid gap-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <Label>VAT Amount:</Label>
              <span className="font-semibold">R {vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <Label>{calculationType === 'add' ? 'Total (VAT Inclusive):' : 'Net Amount (VAT Exclusive):'}</Label>
              <span className="font-semibold">R {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VATCalculator;
