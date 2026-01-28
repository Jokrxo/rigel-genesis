import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IncomeStatement = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Income Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Profit and Loss statement.</p>
          <p className="text-sm text-muted-foreground mt-2">
             Note: This report strictly follows IFRS and IAS guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeStatement;
