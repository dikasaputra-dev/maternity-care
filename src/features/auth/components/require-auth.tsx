import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '@/features/auth/hooks/use-auth';

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectPath = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: redirectPath,
        }}
      />
    );
  }

  return <Outlet />;
}
