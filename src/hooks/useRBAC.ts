
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'owner' | 'admin' | 'accountant' | 'viewer';

export const useRBAC = () => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setRole((data.role || 'viewer') as AppRole);
      }
      setLoading(false);
    };

    fetchRole();
  }, []);

  const hasRole = (requiredRole: AppRole | AppRole[]) => {
    if (!role) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  };

  const can = (action: string, resource: string) => {
    if (!role) return false;
    
    // Owner and Admin can do everything
    if (role === 'owner' || role === 'admin') return true;

    // Accountant permissions
    if (role === 'accountant') {
      const allowedResources = ['invoices', 'quotes', 'orders', 'credit_notes', 'journals', 'expenses', 'products', 'customers', 'suppliers', 'budgets', 'employees', 'inventory', 'projects', 'payroll'];
      if (allowedResources.includes(resource)) return true;
      if (resource === 'reports' && action === 'view') return true;
    }

    // Viewer permissions
    if (role === 'viewer') {
      if (action === 'view' || action === 'read') return true;
    }

    return false;
  };

  return { role, loading, hasRole, can };
};
