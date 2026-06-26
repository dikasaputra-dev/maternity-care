import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';

import { getDefaultAuthenticatedPath } from '@/app/router/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface PublicOnlyRouteProps {
  children?: ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
  }

  return children ?? <Outlet />;
}
