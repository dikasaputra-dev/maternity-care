import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ElementType } from 'react';

import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { hasPermission } from '@/features/auth/lib/authorization';
import type { AuthUser } from '@/features/auth/types/auth.types';

export interface AppNavigationItem {
  id: string;
  label: string;
  to: string;
  icon: ElementType<SvgIconProps>;
  permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
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
  {
    id: 'students',
    label: 'Data Mahasiswa',
    to: '/admin/students',
    icon: SchoolOutlinedIcon,
    permission: PERMISSIONS.STUDENTS_LIST,
  },
];

const pageTitles: Record<string, string> = {
  '/profile': 'Profil',
  '/profile/change-password': 'Ganti Password',
  '/unauthorized': 'Akses Ditolak',
};

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
