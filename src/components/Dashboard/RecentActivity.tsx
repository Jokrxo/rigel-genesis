
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  id: string;
  type: "import" | "invoice" | "tax" | "asset";
  title: string;
  description: string;
  amount?: number;
  date: string;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with actual API call to fetch activities
    const fetchActivities = async () => {
      try {
        // TODO: Implement actual API call
        setActivities([]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "import": return <Badge variant="secondary">Import</Badge>;
      case "invoice": return <Badge variant="outline">Invoice</Badge>;
      case "tax": return <Badge variant="destructive">Tax</Badge>;
      case "asset": return <Badge>Asset</Badge>;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">{activity.description}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {activity.amount !== undefined && (
                    <div className={`font-medium ${activity.amount >= 0 ? "text-success-600" : "text-error-600"}`}>
                      <div className="flex items-center gap-1">
                        {activity.amount >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {`R ${Math.abs(activity.amount).toLocaleString()}`}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">{formatDate(activity.date)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
