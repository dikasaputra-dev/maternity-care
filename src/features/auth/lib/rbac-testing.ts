import {
  APP_NAVIGATION,
  PERMISSION_ROUTES,
  canAccessProtectedPath,
  getRequiredPermissionForPath,
} from '@/app/router/navigation';
import type { Permission } from '@/features/auth/constants/permissions';
import type { AuthRole, AuthUser } from '@/features/auth/types/auth.types';

export interface RouteAccessCheck {
  path: string;
  title: string;
  requiredPermission: Permission | null;
  allowed: boolean;
  reason: string;
}

export interface RbacSnapshot {
  userId: number;
  role: AuthRole;
  totalPermissions: number;
  allowedNavigationLabels: string[];
  allowedRouteCount: number;
  deniedRouteCount: number;
  routeChecks: RouteAccessCheck[];
}

export function checkRouteAccess(user: AuthUser, path: string, title = path): RouteAccessCheck {
  const requiredPermission = getRequiredPermissionForPath(path);

  if (!requiredPermission) {
    return {
      path,
      title,
      requiredPermission: null,
      allowed: false,
      reason: 'Route does not have a permission rule.',
    };
  }

  const allowed = canAccessProtectedPath(user, path);

  return {
    path,
    title,
    requiredPermission,
    allowed,
    reason: allowed
      ? 'User has the required permission.'
      : `User is missing permission: ${requiredPermission}.`,
  };
}

export function createRbacSnapshot(user: AuthUser): RbacSnapshot {
  const routeChecks = PERMISSION_ROUTES.map((route) =>
    checkRouteAccess(user, route.path, route.title),
  );

  const allowedNavigationLabels = APP_NAVIGATION.filter((item) =>
    user.permissions.includes(item.permission),
  ).map((item) => item.label);

  return {
    userId: user.id,
    role: user.role,
    totalPermissions: user.permissions.length,
    allowedNavigationLabels,
    allowedRouteCount: routeChecks.filter((item) => item.allowed).length,
    deniedRouteCount: routeChecks.filter((item) => !item.allowed).length,
    routeChecks,
  };
}
