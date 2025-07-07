import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const IncomeTaxCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState<number | null>(null);
  const [taxYear, setTaxYear] = useState<string>('2024');
  const [ageGroup, setAgeGroup] = useState<string>('under65');
  const [calculatedTax, setCalculatedTax] = useState<number | null>(null);
  const [netIncome, setNetIncome] = useState<number | null>(null);

  // South African tax brackets for 2024 tax year
  const taxBrackets2024 = [
    { min: 0, max: 237100, rate: 0.18, threshold: 0 },
    { min: 237101, max: 370500, rate: 0.26, threshold: 42678 },
    { min: 370501, max: 512800, rate: 0.31, threshold: 77362 },
    { min: 512801, max: 673000, rate: 0.36, threshold: 121475 },
    { min: 673001, max: 857900, rate: 0.39, threshold: 179147 },
    { min: 857901, max: 1817000, rate: 0.41, threshold: 251258 },
    { min: 1817001, max: Infinity, rate: 0.45, threshold: 644489 }
  ];

  // Tax rebates for 2024
  const rebates2024 = {
    primary: 17235, // Under 65
    secondary: 9444, // 65 and over (additional)
    tertiary: 3145   // 75 and over (additional)
  };

  const calculateIncomeTax = () => {
    if (annualIncome === null) {
      alert("Please enter your annual income.");
      return;
    }

    let tax = 0;
    const income = annualIncome;

    // Calculate tax based on brackets
    for (const bracket of taxBrackets2024) {
      if (income > bracket.min) {
        const taxableInBracket = Math.min(income, bracket.max) - bracket.min + 1;
        tax = bracket.threshold + (taxableInBracket * bracket.rate);
      }
    }

    // Apply rebates
    let totalRebate = rebates2024.primary;
    if (ageGroup === '65to74') {
      totalRebate += rebates2024.secondary;
    } else if (ageGroup === '75plus') {
      totalRebate += rebates2024.secondary + rebates2024.tertiary;
    }

    const finalTax = Math.max(0, tax - totalRebate);
    const afterTaxIncome = annualIncome - finalTax;

    setCalculatedTax(finalTax);
    setNetIncome(afterTaxIncome);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Tax Calculator</CardTitle>
        <CardDescription>Calculate South African personal income tax (2024 tax year)</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="annualIncome">Annual Income (R)</Label>
          <Input
            type="number"
            id="annualIncome"
            placeholder="Enter annual income"
            onChange={(e) => setAnnualIncome(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ageGroup">Age Group</Label>
          <Select onValueChange={setAgeGroup} defaultValue={ageGroup}>
            <SelectTrigger id="ageGroup">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under65">Under 65</SelectItem>
              <SelectItem value="65to74">65 to 74 years</SelectItem>
              <SelectItem value="75plus">75 years and older</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="taxYear">Tax Year</Label>
          <Select onValueChange={setTaxYear} defaultValue={taxYear}>
            <SelectTrigger id="taxYear">
              <SelectValue placeholder="Select tax year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={calculateIncomeTax}>Calculate Income Tax</Button>
        {calculatedTax !== null && netIncome !== null && (
          <div className="grid gap-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <Label>Annual Income:</Label>
              <span className="font-semibold">R {annualIncome?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <Label>Income Tax:</Label>
              <span className="font-semibold text-red-600">R {calculatedTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <Label>Net Income:</Label>
              <span className="font-semibold text-green-600">R {netIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <Label>Effective Tax Rate:</Label>
              <span>{((calculatedTax / annualIncome!) * 100).toFixed(2)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeTaxCalculator;
