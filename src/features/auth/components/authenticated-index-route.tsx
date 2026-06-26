import { Navigate } from 'react-router';

import { getDefaultAuthenticatedPath } from '@/app/router/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function AuthenticatedIndexRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
}
