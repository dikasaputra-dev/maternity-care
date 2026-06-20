import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ElementType } from 'react';

import { PERMISSIONS, type Permission } from '@/features/auth/constants/permissions';
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

interface ProtectedRouteRule {
  path: string;
  permission: Permission;
  end?: boolean;
}

export const APP_NAVIGATION: readonly AppNavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    icon: DashboardOutlinedIcon,
    permission: PERMISSIONS.DASHBOARD_VIEW,
    end: true,
  },
  {
    id: 'patients',
    label: 'Pasien',
    to: '/patients',
    icon: PeopleAltOutlinedIcon,
    permission: PERMISSIONS.PATIENTS_LIST,
  },
  {
    id: 'students',
    label: 'Mahasiswa',
    to: '/admin/students',
    icon: SchoolOutlinedIcon,
    permission: PERMISSIONS.STUDENTS_LIST,
  },
  {
    id: 'screenings',
    label: 'Skrining',
    to: '/screenings',
    icon: FactCheckOutlinedIcon,
    permission: PERMISSIONS.SCREENINGS_LIST,
  },
  {
    id: 'history',
    label: 'Riwayat',
    to: '/history',
    icon: HistoryOutlinedIcon,
    permission: PERMISSIONS.HISTORY_VIEW_OWN,
  },
  {
    id: 'reports',
    label: 'Laporan',
    to: '/reports',
    icon: DescriptionOutlinedIcon,
    permission: PERMISSIONS.REPORTS_VIEW,
  },
];

const protectedRouteRules: readonly ProtectedRouteRule[] = [
  {
    path: '/profile/change-password',
    permission: PERMISSIONS.PROFILE_CHANGE_PASSWORD,
    end: true,
  },
  {
    path: '/profile',
    permission: PERMISSIONS.PROFILE_VIEW,
    end: true,
  },
  ...APP_NAVIGATION.map((item) => ({
    path: item.to,
    permission: item.permission,
    end: item.end,
  })),
];

const pageTitles: Record<string, string> = {
  '/profile': 'Profil',
  '/profile/change-password': 'Ganti Password',
  '/unauthorized': 'Akses Ditolak',
};

function getPathname(path: string) {
  const [pathname] = path.split(/[?#]/);

  return pathname || '/';
}

function matchesRoute(pathname: string, rule: ProtectedRouteRule) {
  if (rule.end) {
    return pathname === rule.path;
  }

  return pathname === rule.path || pathname.startsWith(`${rule.path}/`);
}

export function getAllowedNavigationItems(user: AuthUser) {
  return APP_NAVIGATION.filter((item) => hasPermission(user, item.permission));
}

export function getPageTitle(pathname: string) {
  const exactTitle = pageTitles[pathname];

  if (exactTitle) {
    return exactTitle;
  }

  const navigationItem = APP_NAVIGATION.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  );

  return navigationItem?.label ?? 'MaternityCare';
}

export function getDefaultAuthenticatedPath(user: AuthUser) {
  return getAllowedNavigationItems(user)[0]?.to ?? '/unauthorized';
}

export function canAccessProtectedPath(user: AuthUser, path: string) {
  const pathname = getPathname(path);

  const routeRule = protectedRouteRules.find((rule) => matchesRoute(pathname, rule));

  if (!routeRule) {
    return false;
  }

  return hasPermission(user, routeRule.permission);
}

export function resolvePostLoginPath(user: AuthUser, requestedPath?: string) {
  if (requestedPath?.startsWith('/') && canAccessProtectedPath(user, requestedPath)) {
    return requestedPath;
  }

  return getDefaultAuthenticatedPath(user);
}
