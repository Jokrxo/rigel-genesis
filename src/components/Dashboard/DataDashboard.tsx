import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Package, 
  FileText, 
  TrendingUp, 
  DollarSign,
  RefreshCw,
  Building2,
  ShoppingCart
} from "lucide-react";

interface DashboardStats {
  customersCount: number;
  productsCount: number;
  documentsCount: number;
  suppliersCount: number;
  totalRevenue: number;
  pendingInvoices: number;
}

interface RecentDocument {
  id: string;
  document_number: string;
  document_type: string;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name?: string;
}

interface RecentCustomer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  created_at: string;
}

export const DataDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    customersCount: 0,
    productsCount: 0,
    documentsCount: 0,
    suppliersCount: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch documents count and revenue
      const { data: documents, count: documentsCount } = await supabase
        .from('sales_documents')
        .select('*', { count: 'exact' });

      // Fetch suppliers count
      const { count: suppliersCount } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true });

      // Calculate revenue and pending invoices
      const totalRevenue = (documents || [])
        .filter((d) => d.status === 'paid')
        .reduce((sum, d) => sum + (d.total_amount || 0), 0);

      const pendingInvoices = (documents || [])
        .filter((d) => d.document_type === 'invoice' && d.status === 'sent')
        .length;

      setStats({
        customersCount: customersCount || 0,
        productsCount: productsCount || 0,
        documentsCount: documentsCount || 0,
        suppliersCount: suppliersCount || 0,
        totalRevenue,
        pendingInvoices,
      });

      // Fetch recent documents
      const { data: recentDocs } = await supabase
        .from('sales_documents')
        .select(`
          id, document_number, document_type, total_amount, status, created_at,
          customers (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentDocuments((recentDocs || []).map((doc) => ({
        ...doc,
        customer_name: doc.customers?.name || 'Unknown'
      })));

      // Fetch recent customers
      const { data: recentCusts } = await supabase
        .from('customers')
        .select('id, name, company, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentCustomers(recentCusts || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      sent: "secondary",
      draft: "outline",
      overdue: "destructive",
    };
    return variants[status] || "outline";
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customersCount}</div>
            <p className="text-xs text-muted-foreground">Active customer accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsCount}</div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documentsCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingInvoices} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suppliersCount}</div>
            <p className="text-xs text-muted-foreground">Registered suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchDashboardData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <a href="/customers">View Customers</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/documents">View Documents</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/inventory?type=inventory">View Products</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/inventory?type=service">View Services</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Recent Activity */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Recent Documents</TabsTrigger>
          <TabsTrigger value="customers">Recent Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Latest invoices and quotations</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents found. Create your first invoice or quotation.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.document_number}</TableCell>
                        <TableCell className="capitalize">{doc.document_type}</TableCell>
                        <TableCell>{doc.customer_name}</TableCell>
                        <TableCell>{formatCurrency(doc.total_amount)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(doc.status)}>{doc.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
              <CardDescription>Newly added customer accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {recentCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No customers found. Add your first customer.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.company || '-'}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
