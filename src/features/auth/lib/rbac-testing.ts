import {
  APP_NAVIGATION,
  PERMISSION_ROUTES,
  canAccessProtectedPath,
  getDefaultAuthenticatedPath,
  getRequiredPermissionForPath,
} from '@/app/router/navigation';
import { APP_PATHS, type AppPath } from '@/app/router/route-metadata';
import type { Permission } from '@/features/auth/constants/permissions';
import { RBAC_MOCK_USERS } from '@/features/auth/mocks/auth-users.mock';
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

interface RbacRegressionCase {
  id: string;
  title: string;
  user: AuthUser;
  expectedDefaultPath: AppPath;
  allowedPaths: readonly AppPath[];
  deniedPaths: readonly AppPath[];
}

export interface RbacRegressionResult {
  id: string;
  title: string;
  passed: boolean;
  errors: string[];
}

const RBAC_REGRESSION_CASES: readonly RbacRegressionCase[] = [
  {
    id: 'nurse-default-access',
    title: 'Nurse can access nurse menus but not student management',
    user: RBAC_MOCK_USERS.nurse,
    expectedDefaultPath: APP_PATHS.DASHBOARD,
    allowedPaths: [
      APP_PATHS.DASHBOARD,
      APP_PATHS.PATIENTS,
      APP_PATHS.SCREENINGS,
      APP_PATHS.HISTORY,
      APP_PATHS.REPORTS,
      APP_PATHS.PROFILE,
      APP_PATHS.CHANGE_PASSWORD,
    ],
    deniedPaths: [APP_PATHS.STUDENTS],
  },
  {
    id: 'admin-default-access',
    title: 'Admin can access student management',
    user: RBAC_MOCK_USERS.admin,
    expectedDefaultPath: APP_PATHS.DASHBOARD,
    allowedPaths: [
      APP_PATHS.DASHBOARD,
      APP_PATHS.PATIENTS,
      APP_PATHS.SCREENINGS,
      APP_PATHS.HISTORY,
      APP_PATHS.REPORTS,
      APP_PATHS.PROFILE,
      APP_PATHS.CHANGE_PASSWORD,
      APP_PATHS.STUDENTS,
    ],
    deniedPaths: [],
  },
  {
    id: 'nurse-without-dashboard',
    title: 'User without dashboard permission is redirected to first allowed route',
    user: RBAC_MOCK_USERS.nurseWithoutDashboard,
    expectedDefaultPath: APP_PATHS.PATIENTS,
    allowedPaths: [
      APP_PATHS.PATIENTS,
      APP_PATHS.SCREENINGS,
      APP_PATHS.HISTORY,
      APP_PATHS.REPORTS,
      APP_PATHS.PROFILE,
      APP_PATHS.CHANGE_PASSWORD,
    ],
    deniedPaths: [APP_PATHS.DASHBOARD, APP_PATHS.STUDENTS],
  },
  {
    id: 'nurse-without-profile',
    title: 'User without profile permission cannot access profile routes',
    user: RBAC_MOCK_USERS.nurseWithoutProfile,
    expectedDefaultPath: APP_PATHS.DASHBOARD,
    allowedPaths: [
      APP_PATHS.DASHBOARD,
      APP_PATHS.PATIENTS,
      APP_PATHS.SCREENINGS,
      APP_PATHS.HISTORY,
      APP_PATHS.REPORTS,
    ],
    deniedPaths: [APP_PATHS.PROFILE, APP_PATHS.CHANGE_PASSWORD, APP_PATHS.STUDENTS],
  },
  {
    id: 'user-without-permission',
    title: 'User without permissions is redirected to unauthorized',
    user: RBAC_MOCK_USERS.noPermission,
    expectedDefaultPath: APP_PATHS.UNAUTHORIZED,
    allowedPaths: [],
    deniedPaths: [
      APP_PATHS.DASHBOARD,
      APP_PATHS.PATIENTS,
      APP_PATHS.SCREENINGS,
      APP_PATHS.HISTORY,
      APP_PATHS.REPORTS,
      APP_PATHS.PROFILE,
      APP_PATHS.CHANGE_PASSWORD,
      APP_PATHS.STUDENTS,
    ],
  },
];

function createAccessError(path: AppPath, expected: boolean, actual: boolean) {
  return `${path} expected ${expected ? 'allowed' : 'denied'} but got ${
    actual ? 'allowed' : 'denied'
  }.`;
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

export function runRbacRegressionChecks(): RbacRegressionResult[] {
  return RBAC_REGRESSION_CASES.map((testCase) => {
    const errors: string[] = [];
    const defaultPath = getDefaultAuthenticatedPath(testCase.user);

    if (defaultPath !== testCase.expectedDefaultPath) {
      errors.push(`Default path expected ${testCase.expectedDefaultPath} but got ${defaultPath}.`);
    }

    for (const path of testCase.allowedPaths) {
      const allowed = canAccessProtectedPath(testCase.user, path);

      if (!allowed) {
        errors.push(createAccessError(path, true, allowed));
      }
    }

    for (const path of testCase.deniedPaths) {
      const allowed = canAccessProtectedPath(testCase.user, path);

      if (allowed) {
        errors.push(createAccessError(path, false, allowed));
      }
    }

    return {
      id: testCase.id,
      title: testCase.title,
      passed: errors.length === 0,
      errors,
    };
  });
}

export function getFailedRbacRegressionChecks() {
  return runRbacRegressionChecks().filter((result) => !result.passed);
}

export function assertRbacRegressionChecks() {
  const failedChecks = getFailedRbacRegressionChecks();

  if (failedChecks.length === 0) {
    return;
  }

  const message = failedChecks
    .map((check) => {
      const errors = check.errors.map((error) => `- ${error}`).join('\n');

      return `${check.title}\n${errors}`;
    })
    .join('\n\n');

  throw new Error(`RBAC regression checks failed:\n\n${message}`);
}
