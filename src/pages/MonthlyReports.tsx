import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MonthlyReports = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Monthly breakdown and drill-down of financial reports.</p>
          <p className="text-sm text-muted-foreground mt-2">
             Note: strictly follow the guidelines highlighted in IFRS and IAS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReports;
