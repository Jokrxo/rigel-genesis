import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LedgerPosting = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Ledger Posting</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Post transactions to the general ledger.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LedgerPosting;
