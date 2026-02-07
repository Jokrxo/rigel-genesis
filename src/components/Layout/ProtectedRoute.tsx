
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC, AppRole } from "@/hooks/useRBAC";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: AppRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasRole, loading: rbacLoading } = useRBAC();
  const location = useLocation();
  const isMock = String(import.meta.env.VITE_MOCK_API).toLowerCase() === 'true';

  if (loading || rbacLoading) {
    return <PageLoadingSpinner />;
  }

  if (isMock) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(roles)) {
    // If user is logged in but doesn't have permission, redirect to dashboard or show unauthorized
    // For now, redirect to dashboard if not already there, otherwise just show nothing or a specific unauthorized page
    if (location.pathname === '/dashboard') {
        // If they can't even access dashboard (unlikely for valid users), maybe logout?
        // But dashboard should be open to all.
        return <div>Unauthorized</div>; 
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
