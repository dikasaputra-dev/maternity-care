import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ElementType } from 'react';

import {
  APP_PATHS,
  ROUTE_METADATA,
  type AppRouteMetadata,
  type NavigationRouteMetadata,
  type PermissionRouteMetadata,
} from '@/app/router/route-metadata';
import type { Permission } from '@/features/auth/constants/permissions';
import { hasPermission } from '@/features/auth/lib/authorization';
import type { AuthUser } from '@/features/auth/types/auth.types';

export interface AppNavigationItem {
  id: string;
  label: string;
  to: string;
  icon: ElementType<SvgIconProps>;
  permission: Permission;
  end?: boolean;
}

function getPathname(path: string) {
  const pathname = path.split(/[?#]/).at(0);

  if (!pathname?.startsWith('/')) {
    return APP_PATHS.ROOT;
  }

  return pathname;
}

function getSegments(path: string) {
  return path.split('/').filter(Boolean);
}

function isDynamicSegment(segment: string) {
  return segment.startsWith(':');
}

function isPermissionRoute(route: AppRouteMetadata): route is PermissionRouteMetadata {
  return route.access === 'permission';
}

function isNavigationRoute(route: AppRouteMetadata): route is NavigationRouteMetadata {
  return isPermissionRoute(route) && route.navigation !== undefined;
}

function matchesRoute(pathname: string, route: AppRouteMetadata) {
  const routeSegments = getSegments(route.path);
  const pathSegments = getSegments(pathname);

  if (route.end && routeSegments.length !== pathSegments.length) {
    return false;
  }

  if (routeSegments.length > pathSegments.length) {
    return false;
  }

  return routeSegments.every((routeSegment, index) => {
    const pathSegment = pathSegments[index];

    return (
      pathSegment !== undefined && (isDynamicSegment(routeSegment) || routeSegment === pathSegment)
    );
  });
}

function getRouteScore(route: AppRouteMetadata) {
  const segments = getSegments(route.path);
  const staticSegments = segments.filter((segment) => !isDynamicSegment(segment)).length;

  return segments.length * 10 + staticSegments;
}

function findBestMatchingRoute<TRoute extends AppRouteMetadata>(
  routes: readonly TRoute[],
  pathname: string,
) {
  const matchedRoutes = routes.filter((route) => matchesRoute(pathname, route));

  return (
    matchedRoutes
      .sort((firstRoute, secondRoute) => getRouteScore(secondRoute) - getRouteScore(firstRoute))
      .at(0) ?? null
  );
}

export const PERMISSION_ROUTES: readonly PermissionRouteMetadata[] =
  ROUTE_METADATA.filter(isPermissionRoute);

export const APP_NAVIGATION: readonly AppNavigationItem[] = ROUTE_METADATA.filter(
  isNavigationRoute,
).map((route) => ({
  id: route.id,
  label: route.navigation.label,
  to: route.path,
  icon: route.navigation.icon,
  permission: route.permission,
  end: route.end,
}));

export function getAllowedNavigationItems(user: AuthUser) {
  return APP_NAVIGATION.filter((item) => hasPermission(user, item.permission));
}

export function getPageTitle(pathname: string) {
  const normalizedPathname = getPathname(pathname);
  const matchedRoute = findBestMatchingRoute(ROUTE_METADATA, normalizedPathname);

  return matchedRoute?.title ?? 'MaternityCare';
}

export function getRequiredPermissionForPath(path: string) {
  const pathname = getPathname(path);
  const routeRule = findBestMatchingRoute(PERMISSION_ROUTES, pathname);

  return routeRule?.permission ?? null;
}

export function canAccessProtectedPath(user: AuthUser, path: string) {
  const requiredPermission = getRequiredPermissionForPath(path);

  if (!requiredPermission) {
    return false;
  }

  return hasPermission(user, requiredPermission);
}

export function getDefaultAuthenticatedPath(user: AuthUser) {
  const allowedNavigationPath = getAllowedNavigationItems(user).at(0)?.to;

  if (allowedNavigationPath) {
    return allowedNavigationPath;
  }

  const firstAllowedPermissionRoute = PERMISSION_ROUTES.find((route) =>
    hasPermission(user, route.permission),
  );

  return firstAllowedPermissionRoute?.path ?? APP_PATHS.UNAUTHORIZED;
}

export function resolvePostLoginPath(user: AuthUser, requestedPath?: string) {
  if (requestedPath?.startsWith('/') && canAccessProtectedPath(user, requestedPath)) {
    return requestedPath;
  }

  return getDefaultAuthenticatedPath(user);
}
