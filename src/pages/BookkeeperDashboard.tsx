
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Users, 
  ArrowRightLeft, 
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientCompany {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive';
  last_active: string;
  tax_status: 'compliant' | 'due' | 'overdue';
  pending_tasks: number;
}

// Mock data for demonstration until backend migration is applied
const MOCK_CLIENTS: ClientCompany[] = [
  {
    id: "c1",
    name: "Acme Corp Logistics",
    status: "active",
    last_active: "2024-03-10",
    tax_status: "compliant",
    pending_tasks: 3
  },
  {
    id: "c2",
    name: "Global Tech Solutions",
    status: "active",
    last_active: "2024-03-12",
    tax_status: "due",
    pending_tasks: 12
  },
  {
    id: "c3",
    name: "Sunrise Bakery",
    status: "pending",
    last_active: "2024-03-01",
    tax_status: "overdue",
    pending_tasks: 5
  }
];

const BookkeeperDashboard = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientCompany[]>(MOCK_CLIENTS);
  const [loading, setLoading] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentContext();
  }, []);

  const fetchCurrentContext = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
      if (data) setCurrentCompanyId(data.company_id);
    }
  };

  const handleSwitchClient = async (clientId: string, clientName: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would call the RPC function
      // const { error } = await supabase.rpc('switch_company_context', { target_company_id: clientId });
      
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just show success
      // If the migration hasn't been run, the RPC would fail.
      
      toast({
        title: "Context Switched",
        description: `Now managing: ${clientName}`,
      });
      
      // Update local state to reflect change (mock)
      setCurrentCompanyId(clientId);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Error switching context",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Practice Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your client portfolio and financial tasks
            </p>
          </div>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Invite New Client
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20</div>
              <p className="text-xs text-muted-foreground">Across all clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Returns Due</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Due within 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Health Score</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">88%</div>
              <p className="text-xs text-muted-foreground">+2.5% increase</p>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle>Client Portfolio</CardTitle>
            <CardDescription>
              Select a client to switch your active session context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tax Status</TableHead>
                  <TableHead>Pending Tasks</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        client.tax_status === 'compliant' ? 'outline' : 
                        client.tax_status === 'due' ? 'secondary' : 'destructive'
                      }>
                        {client.tax_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.pending_tasks}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {client.last_active}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant={currentCompanyId === client.id ? "secondary" : "default"}
                        onClick={() => handleSwitchClient(client.id, client.name)}
                        disabled={loading || currentCompanyId === client.id}
                      >
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        {currentCompanyId === client.id ? 'Active' : 'Switch Context'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BookkeeperDashboard;
