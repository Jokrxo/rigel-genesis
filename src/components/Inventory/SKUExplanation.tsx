
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

const SKUExplanation = () => {
  return (
    <Card className="border-info/30 bg-info/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          What is SKU?
        </CardTitle>
        <CardDescription>
          Understanding Stock Keeping Units in inventory management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm">
            <strong>SKU (Stock Keeping Unit)</strong> is a unique identifier assigned to each distinct product or item in your inventory. 
            It's an alphanumeric code that helps you track and manage your products efficiently.
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Key Features of SKUs:</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• <strong>Unique identification:</strong> Each product variant gets its own SKU</li>
            <li>• <strong>Inventory tracking:</strong> Monitor stock levels, sales, and movement</li>
            <li>• <strong>Organizational tool:</strong> Categorize products by type, size, color, etc.</li>
            <li>• <strong>Internal use:</strong> Different from UPC/barcode (which are universal)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">SKU Examples:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">TSHIRT-RED-M</Badge>
            <Badge variant="outline">LAPTOP-DELL-15IN</Badge>
            <Badge variant="outline">CHAIR-OFFICE-BLK</Badge>
            <Badge variant="outline">BOOK-FINANCE-001</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Best Practices:</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• Keep SKUs short but descriptive</li>
            <li>• Use consistent naming conventions</li>
            <li>• Avoid special characters that might cause system issues</li>
            <li>• Include key product attributes (category, size, color)</li>
            <li>• Make them human-readable for easier management</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SKUExplanation;
