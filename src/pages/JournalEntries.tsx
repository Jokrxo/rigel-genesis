import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const JournalEntries = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p>View and manage journal entries.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEntries;
