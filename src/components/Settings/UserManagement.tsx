
import { useState, useEffect, useCallback } from "react";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = supabaseClient;
import { useToast } from "@/hooks/use-toast";
import { useRBAC } from "@/hooks/useRBAC";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Shield, Mail } from "lucide-react";

type AppRole = 'admin' | 'manager' | 'accountant' | 'viewer';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: AppRole;
  email?: string; // Derived from auth.users if possible, or stored in profile
  created_at: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { role: currentUserRole, can } = useRBAC();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: currentUserProfile } = await (supabase as any)
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!currentUserProfile?.company_id) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('company_id', currentUserProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers((data || []) as unknown as UserProfile[]);

    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'default'; // black/white
      case 'admin': return 'destructive'; // red
      case 'accountant': return 'secondary'; // gray
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  if (!can('manage_users', 'settings') && currentUserRole !== 'owner' && currentUserRole !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>You do not have permission to manage the team.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Manage users and their roles within your organization
            </CardDescription>
          </div>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                           {/* Email would go here if available */}
                           User ID: {user.user_id.substring(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Badge variant={getRoleBadgeColor(user.role) as any}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {currentUserRole === 'owner' || (currentUserRole === 'admin' && user.role !== 'owner') ? (
                        <Select 
                          defaultValue={user.role} 
                          onValueChange={(val) => updateUserRole(user.user_id, val as AppRole)}
                          disabled={user.role === 'owner' && currentUserRole !== 'owner'} // Only owner can change owner role (conceptually)
                        >
                          <SelectTrigger className="w-[130px] ml-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="accountant">Accountant</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            {currentUserRole === 'owner' && <SelectItem value="owner">Owner</SelectItem>}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-muted-foreground text-sm">No actions</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
