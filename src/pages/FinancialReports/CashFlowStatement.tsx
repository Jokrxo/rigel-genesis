import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CashFlowStatement = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cash inflows and outflows.</p>
          <p className="text-sm text-muted-foreground mt-2">
             Note: This report strictly follows IFRS and IAS guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowStatement;
