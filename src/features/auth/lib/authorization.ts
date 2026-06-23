import type { Permission } from '@/features/auth/constants/permissions';
import type { AuthUser } from '@/features/auth/types/auth.types';

export function hasPermission(user: AuthUser | null | undefined, permission: Permission) {
  return user?.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(
  user: AuthUser | null | undefined,
  permissions: readonly Permission[],
) {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function hasEveryPermission(
  user: AuthUser | null | undefined,
  permissions: readonly Permission[],
) {
  return permissions.every((permission) => hasPermission(user, permission));
}
