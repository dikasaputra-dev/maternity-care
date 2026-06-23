import type { ReactNode } from 'react';

import type { Permission } from '@/features/auth/constants/permissions';
import { hasPermission } from '@/features/auth/lib/authorization';
import { useAuth } from '@/features/auth/hooks/use-auth';

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
