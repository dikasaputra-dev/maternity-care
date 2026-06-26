import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface RequireAuthProps {
  children?: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-600">Memulihkan sesi...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={APP_PATHS.LOGIN} replace state={{ from: location.pathname }} />;
  }

  return children ?? <Outlet />;
}
