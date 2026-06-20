import type { ReactNode } from 'react';

import type { Permission } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ children, fallback = null, permission }: PermissionGateProps) {
  const { user } = useAuth();

  if (!hasPermission(user, permission)) {
    return fallback;
  }

  return children;
}
