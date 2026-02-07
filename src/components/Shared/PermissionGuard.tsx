
import React from 'react';
import { useRBAC, AppRole } from '@/hooks/useRBAC';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: AppRole | AppRole[];
  action?: string;
  resource?: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRole,
  action,
  resource,
  fallback = null,
}) => {
  const { role, hasRole, can, loading } = useRBAC();

  if (loading) return null; // Or a spinner

  if (requiredRole) {
    if (hasRole(requiredRole)) {
      return <>{children}</>;
    }
  }

  if (action && resource) {
    if (can(action, resource)) {
      return <>{children}</>;
    }
  }

  return <>{fallback}</>;
};
