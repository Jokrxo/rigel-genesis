
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, ArrowUp, ArrowDown, UserPlus, FileType } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  id: string;
  type: "import" | "invoice" | "quote" | "customer" | "payment" | "tax" | "asset";
  title: string;
  description: string;
  amount?: number;
  date: string;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch recent sales documents (Invoices & Quotes)
        const { data: documents } = await supabase
          .from('sales_documents')
          .select('id, document_number, document_type, total_amount, created_at, customer_id, customers(name)')
          .order('created_at', { ascending: false })
          .limit(5);

        // 2. Fetch recent customers
        const { data: customers } = await supabase
          .from('customers')
          .select('id, name, created_at, company')
          .order('created_at', { ascending: false })
          .limit(5);

        // 3. Fetch recent receipts
        const { data: receipts } = await supabase
          .from('receipts')
          .select('id, receipt_number, amount, created_at, customer_id, customers(name)')
          .order('created_at', { ascending: false })
          .limit(5);

        // 4. Fetch recent manual transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('id, description, amount, type, category, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        // 5. Transform and merge
        const docActivities: Activity[] = (documents || []).map((doc: any) => ({
          id: doc.id,
          type: doc.document_type === 'invoice' ? 'invoice' : 'quote',
          title: `${doc.document_type === 'invoice' ? 'Invoice' : 'Quote'} #${doc.document_number}`,
          description: `Created for ${doc.customers?.name || 'Unknown Customer'}`,
          amount: doc.total_amount,
          date: doc.created_at
        }));

        const custActivities: Activity[] = (customers || []).map((cust: any) => ({
          id: cust.id,
          type: 'customer',
          title: 'New Customer',
          description: `${cust.name} ${cust.company ? `(${cust.company})` : ''} added`,
          date: cust.created_at
        }));

        const receiptActivities: Activity[] = (receipts || []).map((receipt: any) => ({
          id: receipt.id,
          type: 'payment',
          title: `Payment #${receipt.receipt_number}`,
          description: `Received from ${receipt.customers?.name || 'Unknown Customer'}`,
          amount: receipt.amount,
          date: receipt.created_at
        }));

        const transactionActivities: Activity[] = (transactions || []).map((trx: any) => ({
          id: trx.id,
          type: trx.type === 'income' ? 'payment' : 'asset', // 'asset' is just a placeholder icon, maybe add 'expense' type
          title: trx.description,
          description: `Manual Transaction (${trx.category})`,
          amount: trx.amount,
          date: trx.created_at
        }));

        // Combine and sort
        const allActivities = [...docActivities, ...custActivities, ...receiptActivities, ...transactionActivities]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10); // Take top 10

        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
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
      case "invoice": return <Badge variant="default">Invoice</Badge>;
      case "payment": return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Payment</Badge>;
      case "quote": return <Badge variant="outline">Quote</Badge>;
      case "customer": return <UserPlus className="h-4 w-4 text-primary" />;
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
          ) : activities.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No recent activity found.
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-xs text-muted-foreground">{activity.description}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {activity.amount !== undefined && (
                    <div className={`font-medium text-sm ${activity.type === 'invoice' || activity.type === 'payment' ? "text-emerald-600" : ""}`}>
                      <div className="flex items-center gap-1">
                        {(activity.type === 'invoice' || activity.type === 'payment') && <ArrowUp className="h-3 w-3" />}
                        {`R ${Math.abs(activity.amount).toLocaleString()}`}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">{formatDate(activity.date)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
