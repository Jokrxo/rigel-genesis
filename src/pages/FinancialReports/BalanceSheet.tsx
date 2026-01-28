import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BalanceSheet = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Financial Position of the company.</p>
          <p className="text-sm text-muted-foreground mt-2">
             Note: This report strictly follows IFRS and IAS guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSheet;
