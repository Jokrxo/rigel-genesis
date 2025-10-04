
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center pt-1 text-xs text-muted-foreground">
        {change > 0 ? (
          <>
            <ArrowUp className="mr-1 h-4 w-4 text-success" />
            <span className="text-success">
              {change.toString()}% from last month
            </span>
          </>
        ) : (
          <>
            <ArrowDown className="mr-1 h-4 w-4 text-error" />
            <span className="text-error">
              {Math.abs(change).toString()}% from last month
            </span>
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
