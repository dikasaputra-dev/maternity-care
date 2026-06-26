import {
  APP_PATHS,
  ROUTE_METADATA,
  type AppPath,
  type RouteMetadata,
} from '@/app/router/route-metadata';
import type { Permission } from '@/features/auth/constants/permissions';
import type { AuthUser } from '@/features/auth/types/auth.types';

export interface AppNavigationItem {
  id: string;
  label: string;
  path: AppPath;
  permission: Permission;
}

interface OrderedNavigationItem extends AppNavigationItem {
  order: number;
}

function getSegments(pathname: string) {
  return pathname.split('/').filter(Boolean);
}

function isDynamicSegment(segment: string) {
  return segment.startsWith(':');
}

function matchesRoute(pathname: string, routePath: string) {
  if (routePath === APP_PATHS.NOT_FOUND) {
    return false;
  }

  if (pathname === routePath) {
    return true;
  }

  const pathnameSegments = getSegments(pathname);
  const routeSegments = getSegments(routePath);

  if (pathnameSegments.length !== routeSegments.length) {
    return false;
  }

  return routeSegments.every((routeSegment, index) => {
    const currentSegment = pathnameSegments[index];

    if (!currentSegment) {
      return false;
    }

    return isDynamicSegment(routeSegment) || routeSegment === currentSegment;
  });
}

function getRouteScore(route: RouteMetadata) {
  return getSegments(route.path).reduce((score, segment) => {
    if (isDynamicSegment(segment)) {
      return score + 1;
    }

    return score + 2;
  }, 0);
}

function findBestMatchingRoute(pathname: string) {
  return ROUTE_METADATA.filter((route) => matchesRoute(pathname, route.path)).sort(
    (a, b) => getRouteScore(b) - getRouteScore(a),
  )[0];
}

export function getPageTitle(pathname: string) {
  return findBestMatchingRoute(pathname)?.title ?? 'MaternityCare';
}

export function getAllowedNavigationItems(user: AuthUser | null | undefined): AppNavigationItem[] {
  if (!user) {
    return [];
  }

  const items: OrderedNavigationItem[] = [];

  for (const route of ROUTE_METADATA) {
    if (route.access !== 'permission') {
      continue;
    }

    const navigation = route.navigation;

    if (!navigation) {
      continue;
    }

    if (!user.permissions.includes(route.permission)) {
      continue;
    }

    items.push({
      id: route.id,
      label: navigation.label,
      path: route.path,
      permission: route.permission,
      order: navigation.order,
    });
  }

  return items
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      id: item.id,
      label: item.label,
      path: item.path,
      permission: item.permission,
    }));
}

export function canAccessProtectedPath(user: AuthUser | null | undefined, pathname: string) {
  const route = findBestMatchingRoute(pathname);

  if (!route) {
    return false;
  }

  if (route.access === 'public-only') {
    return true;
  }

  if (!user) {
    return false;
  }

  if (route.access === 'authenticated') {
    return true;
  }

  if (route.access !== 'permission') {
    return false;
  }

  return user.permissions.includes(route.permission);
}

export function getDefaultAuthenticatedPath(user: AuthUser) {
  const firstAllowedNavigationItem = getAllowedNavigationItems(user)[0];

  return firstAllowedNavigationItem?.path ?? APP_PATHS.PROFILE;
}

export function resolvePostLoginPath(user: AuthUser, requestedPath?: string) {
  if (
    requestedPath &&
    requestedPath !== APP_PATHS.LOGIN &&
    canAccessProtectedPath(user, requestedPath)
  ) {
    return requestedPath;
  }

  return getDefaultAuthenticatedPath(user);
}
