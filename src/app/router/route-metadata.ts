import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ElementType } from 'react';

import { PERMISSIONS, type Permission } from '@/features/auth/constants/permissions';

export const APP_PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  PATIENT_CREATE: '/patients/create',
  PATIENT_DETAIL: '/patients/:patientId',
  SCREENINGS: '/screenings',
  HISTORY: '/history',
  REPORTS: '/reports',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/change-password',
  STUDENTS: '/admin/students',
  UNAUTHORIZED: '/unauthorized',
} as const;

export type AppPath = (typeof APP_PATHS)[keyof typeof APP_PATHS];

export type RouteAccess = 'public' | 'public-only' | 'authenticated' | 'permission';

export interface NavigationMetadata {
  label: string;
  icon: ElementType<SvgIconProps>;
}

interface BaseRouteMetadata {
  id: string;
  path: AppPath;
  title: string;
  end?: boolean;
}

export interface PublicRouteMetadata extends BaseRouteMetadata {
  access: 'public' | 'public-only' | 'authenticated';
  permission?: never;
  navigation?: never;
}

export interface PermissionRouteMetadata extends BaseRouteMetadata {
  access: 'permission';
  permission: Permission;
  navigation?: NavigationMetadata;
}

export type AppRouteMetadata = PublicRouteMetadata | PermissionRouteMetadata;

export type NavigationRouteMetadata = PermissionRouteMetadata & {
  navigation: NavigationMetadata;
};

export const ROUTE_METADATA: readonly AppRouteMetadata[] = [
  {
    id: 'root',
    path: APP_PATHS.ROOT,
    title: 'MaternityCare',
    access: 'authenticated',
    end: true,
  },
  {
    id: 'login',
    path: APP_PATHS.LOGIN,
    title: 'Login',
    access: 'public-only',
    end: true,
  },
  {
    id: 'dashboard',
    path: APP_PATHS.DASHBOARD,
    title: 'Dashboard',
    access: 'permission',
    permission: PERMISSIONS.DASHBOARD_VIEW,
    navigation: {
      label: 'Dashboard',
      icon: DashboardOutlinedIcon,
    },
    end: true,
  },
  {
    id: 'patients',
    path: APP_PATHS.PATIENTS,
    title: 'Pasien',
    access: 'permission',
    permission: PERMISSIONS.PATIENTS_LIST,
    navigation: {
      label: 'Pasien',
      icon: PeopleAltOutlinedIcon,
    },
  },
  {
    id: 'patient-create',
    path: APP_PATHS.PATIENT_CREATE,
    title: 'Tambah Pasien',
    access: 'permission',
    permission: PERMISSIONS.PATIENTS_CREATE,
    end: true,
  },
  {
    id: 'patient-detail',
    path: APP_PATHS.PATIENT_DETAIL,
    title: 'Detail Pasien',
    access: 'permission',
    permission: PERMISSIONS.PATIENTS_VIEW,
    end: true,
  },
  {
    id: 'screenings',
    path: APP_PATHS.SCREENINGS,
    title: 'Skrining',
    access: 'permission',
    permission: PERMISSIONS.SCREENINGS_LIST,
    navigation: {
      label: 'Skrining',
      icon: FactCheckOutlinedIcon,
    },
  },
  {
    id: 'history',
    path: APP_PATHS.HISTORY,
    title: 'Riwayat',
    access: 'permission',
    permission: PERMISSIONS.HISTORY_VIEW_OWN,
    navigation: {
      label: 'Riwayat',
      icon: HistoryOutlinedIcon,
    },
  },
  {
    id: 'reports',
    path: APP_PATHS.REPORTS,
    title: 'Laporan',
    access: 'permission',
    permission: PERMISSIONS.REPORTS_VIEW,
    navigation: {
      label: 'Laporan',
      icon: DescriptionOutlinedIcon,
    },
  },
  {
    id: 'profile',
    path: APP_PATHS.PROFILE,
    title: 'Profil',
    access: 'permission',
    permission: PERMISSIONS.PROFILE_VIEW,
    end: true,
  },
  {
    id: 'change-password',
    path: APP_PATHS.CHANGE_PASSWORD,
    title: 'Ganti Password',
    access: 'permission',
    permission: PERMISSIONS.PROFILE_CHANGE_PASSWORD,
    end: true,
  },
  {
    id: 'students',
    path: APP_PATHS.STUDENTS,
    title: 'Data Mahasiswa',
    access: 'permission',
    permission: PERMISSIONS.STUDENTS_LIST,
    navigation: {
      label: 'Data Mahasiswa',
      icon: SchoolOutlinedIcon,
    },
  },
  {
    id: 'unauthorized',
    path: APP_PATHS.UNAUTHORIZED,
    title: 'Akses Ditolak',
    access: 'authenticated',
    end: true,
  },
];
