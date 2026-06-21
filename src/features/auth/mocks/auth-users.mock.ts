import {
  ALL_PERMISSIONS,
  NURSE_PERMISSIONS,
  PERMISSIONS,
  type Permission,
} from '@/features/auth/constants/permissions';
import type { AuthUser } from '@/features/auth/types/auth.types';

function withoutPermissions(
  permissions: readonly Permission[],
  removedPermissions: readonly Permission[],
): Permission[] {
  return permissions.filter((permission) => !removedPermissions.includes(permission));
}

export const MOCK_NURSE_USER: AuthUser = {
  id: 1,
  name: 'Rina Nuraini',
  nim: '251FK05002',
  email: 'rina.nuraini@example.com',
  role: 'nurse',
  permissions: [...NURSE_PERMISSIONS],
};

export const MOCK_ADMIN_USER: AuthUser = {
  id: 2,
  name: 'Admin MaternityCare',
  nim: null,
  email: 'admin@example.com',
  role: 'admin',
  permissions: [...ALL_PERMISSIONS],
};

export const MOCK_NURSE_WITHOUT_DASHBOARD_USER: AuthUser = {
  id: 3,
  name: 'Nurse Tanpa Dashboard',
  nim: '251FK05003',
  email: 'nurse.no.dashboard@example.com',
  role: 'nurse',
  permissions: withoutPermissions(NURSE_PERMISSIONS, [PERMISSIONS.DASHBOARD_VIEW]),
};

export const MOCK_NURSE_WITHOUT_PROFILE_USER: AuthUser = {
  id: 4,
  name: 'Nurse Tanpa Profil',
  nim: '251FK05004',
  email: 'nurse.no.profile@example.com',
  role: 'nurse',
  permissions: withoutPermissions(NURSE_PERMISSIONS, [
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_CHANGE_PASSWORD,
  ]),
};

export const MOCK_USER_WITHOUT_PERMISSION: AuthUser = {
  id: 5,
  name: 'User Tanpa Permission',
  nim: '251FK05005',
  email: 'no.permission@example.com',
  role: 'nurse',
  permissions: [],
};

export const RBAC_MOCK_USERS = {
  nurse: MOCK_NURSE_USER,
  admin: MOCK_ADMIN_USER,
  nurseWithoutDashboard: MOCK_NURSE_WITHOUT_DASHBOARD_USER,
  nurseWithoutProfile: MOCK_NURSE_WITHOUT_PROFILE_USER,
  noPermission: MOCK_USER_WITHOUT_PERMISSION,
} as const;
