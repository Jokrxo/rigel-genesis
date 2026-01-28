import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GeneralLedger = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>General Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Complete record of all financial transactions.</p>
          <p className="text-sm text-muted-foreground mt-2">
             Note: This report strictly follows IFRS and IAS guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralLedger;
