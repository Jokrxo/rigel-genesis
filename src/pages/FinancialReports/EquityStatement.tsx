import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EquityStatement = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Statement of Changes in Equity</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Changes in owner's equity.</p>
          <p className="text-sm text-muted-foreground mt-2">
             Note: This report strictly follows IFRS and IAS guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquityStatement;
