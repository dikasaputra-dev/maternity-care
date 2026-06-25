import type { Permission } from '@/features/auth/constants/permissions';
import { PERMISSIONS } from '@/features/auth/constants/permissions';

export const APP_PATHS = {
  ROOT: '/',
  LOGIN: '/login',

  DASHBOARD: '/dashboard',

  PATIENTS: '/patients',
  PATIENT_CREATE: '/patients/create',
  PATIENT_DETAIL: '/patients/:patientId',
  PATIENT_EDIT: '/patients/:patientId/edit',

  SCREENINGS: '/initial-screenings',

  INITIAL_SCREENING_CREATE: '/patients/:patientId/initial-screening/create',

  HISTORY: '/history',
  REPORTS: '/reports',

  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/change-password',

  STUDENTS: '/admin/students',

  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
} as const;

export type AppPath = (typeof APP_PATHS)[keyof typeof APP_PATHS];

export interface NavigationMetadata {
  label: string;
  order: number;
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

export type RouteMetadata = PublicRouteMetadata | PermissionRouteMetadata;

export const ROUTE_METADATA = [
  {
    id: 'login',
    path: APP_PATHS.LOGIN,
    title: 'Login',
    access: 'public-only',
  },
  {
    id: 'dashboard',
    path: APP_PATHS.DASHBOARD,
    title: 'Dashboard',
    access: 'permission',
    permission: PERMISSIONS.DASHBOARD_VIEW,
    navigation: {
      label: 'Dashboard',
      order: 10,
    },
  },
  {
    id: 'patients',
    path: APP_PATHS.PATIENTS,
    title: 'Pasien',
    access: 'permission',
    permission: PERMISSIONS.PATIENTS_LIST,
    end: true,
    navigation: {
      label: 'Pasien',
      order: 20,
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
    id: 'patient-edit',
    path: APP_PATHS.PATIENT_EDIT,
    title: 'Edit Pasien',
    access: 'permission',
    permission: PERMISSIONS.PATIENTS_UPDATE,
    end: true,
  },
  {
    id: 'initial-screening-create',
    path: APP_PATHS.INITIAL_SCREENING_CREATE,
    title: 'Tambah Skrining Awal',
    access: 'permission',
    permission: PERMISSIONS.SCREENINGS_CREATE,
    end: true,
  },
  {
    id: 'history',
    path: APP_PATHS.HISTORY,
    title: 'Riwayat',
    access: 'permission',
    permission: PERMISSIONS.HISTORY_VIEW_OWN,
    navigation: {
      label: 'Riwayat',
      order: 40,
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
      order: 50,
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
      order: 90,
    },
  },
  {
    id: 'unauthorized',
    path: APP_PATHS.UNAUTHORIZED,
    title: 'Akses Ditolak',
    access: 'authenticated',
  },
] satisfies RouteMetadata[];
