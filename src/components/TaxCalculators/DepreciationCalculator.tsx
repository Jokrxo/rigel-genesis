import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DepreciationCalculator = () => {
  const [assetCost, setAssetCost] = useState<number | null>(null);
  const [salvageValue, setSalvageValue] = useState<number | null>(null);
  const [usefulLife, setUsefulLife] = useState<number | null>(null);
  const [depreciationMethod, setDepreciationMethod] = useState<'straight-line' | 'declining-balance' | 'sum-of-years'>('straight-line');
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  const calculateDepreciation = () => {
    if (assetCost === null || salvageValue === null || usefulLife === null) {
      alert("Please fill in all fields.");
      return;
    }

    let depreciation;
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
      default:
        depreciation = 0;
    }

    setCalculatedValue(depreciation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Depreciation Calculator</CardTitle>
        <CardDescription>Calculate the depreciation of an asset.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="assetCost">Asset Cost</Label>
          <Input
            type="number"
            id="assetCost"
            placeholder="Enter asset cost"
            onChange={(e) => setAssetCost(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="salvageValue">Salvage Value</Label>
          <Input
            type="number"
            id="salvageValue"
            placeholder="Enter salvage value"
            onChange={(e) => setSalvageValue(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="usefulLife">Useful Life (Years)</Label>
          <Input
            type="number"
            id="usefulLife"
            placeholder="Enter useful life"
            onChange={(e) => setUsefulLife(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="depreciationMethod">Depreciation Method</Label>
          <Select onValueChange={(value) => setDepreciationMethod(value as 'straight-line' | 'declining-balance' | 'sum-of-years')}>
            <SelectTrigger id="depreciationMethod">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="straight-line">Straight Line</SelectItem>
              <SelectItem value="declining-balance">Declining Balance</SelectItem>
              <SelectItem value="sum-of-years">Sum of Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={calculateDepreciation}>Calculate Depreciation</Button>
        {calculatedValue !== null && (
          <div className="grid gap-2">
            <Label>Calculated Depreciation</Label>
            <Input value={typeof calculatedValue === "number" ? calculatedValue.toString() : ""} readOnly />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepreciationCalculator;
