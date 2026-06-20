import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import type { Permission } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
}

export function RequirePermission({ children, permission }: RequirePermissionProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  if (!hasPermission(user, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
