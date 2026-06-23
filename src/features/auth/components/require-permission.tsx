import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import type { Permission } from '@/features/auth/constants/permissions';
import { hasPermission } from '@/features/auth/lib/authorization';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
}

export function RequirePermission({ children, permission }: RequirePermissionProps) {
  const location = useLocation();
  const { loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to={APP_PATHS.LOGIN} replace state={{ from: location.pathname }} />;
  }

  if (!hasPermission(user, permission)) {
    return (
      <Navigate
        to={APP_PATHS.UNAUTHORIZED}
        replace
        state={{
          from: location.pathname,
          requiredPermission: permission,
        }}
      />
    );
  }

  return children;
}
