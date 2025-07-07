
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";
import React from "react";

const ImportCompleteCard: React.FC = () => (
  <Card className="bg-success-50 border-success-500">
    <CardHeader>
      <CardTitle className="flex items-center text-success-600">
        <Check className="mr-2 h-5 w-5" /> Import Complete
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p>Your bank statement has been successfully processed. Financial statements are now available.</p>
      <div className="flex gap-2 flex-wrap">
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          <span>View Financial Report</span>
        </Button>
        <Button variant="outline">View Transactions</Button>
      </div>
    </CardContent>
  </Card>
);

export default ImportCompleteCard;
