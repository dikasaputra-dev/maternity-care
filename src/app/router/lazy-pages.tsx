import { lazy } from 'react';

export const ChangePasswordPage = lazy(() =>
  import('@/pages/change-password-page').then((module) => ({ default: module.ChangePasswordPage })),
);
export const DashboardPage = lazy(() =>
  import('@/pages/dashboard-page').then((module) => ({ default: module.DashboardPage })),
);
export const InitialScreeningCreatePage = lazy(() =>
  import('@/pages/initial-screening-create-page').then((module) => ({
    default: module.InitialScreeningCreatePage,
  })),
);
export const InitialScreeningDetailPage = lazy(() =>
  import('@/pages/initial-screening-detail-page').then((module) => ({
    default: module.InitialScreeningDetailPage,
  })),
);
export const InitialScreeningsPage = lazy(() =>
  import('@/pages/initial-screenings-page').then((module) => ({
    default: module.InitialScreeningsPage,
  })),
);
export const LaborMonitoringCreatePage = lazy(() =>
  import('@/pages/labor-monitoring-create-page').then((module) => ({
    default: module.LaborMonitoringCreatePage,
  })),
);
export const LaborMonitoringDetailPage = lazy(() =>
  import('@/pages/labor-monitoring-detail-page').then((module) => ({
    default: module.LaborMonitoringDetailPage,
  })),
);
export const LaborMonitoringEditPage = lazy(() =>
  import('@/pages/labor-monitoring-edit-page').then((module) => ({
    default: module.LaborMonitoringEditPage,
  })),
);
export const LoginPage = lazy(() =>
  import('@/pages/login-page').then((module) => ({ default: module.LoginPage })),
);
export const ModulePreviewPage = lazy(() =>
  import('@/pages/module-preview-page').then((module) => ({ default: module.ModulePreviewPage })),
);
export const NotFoundPage = lazy(() =>
  import('@/pages/not-found-page').then((module) => ({ default: module.NotFoundPage })),
);
export const PatientCreatePage = lazy(() =>
  import('@/pages/patient-create-page').then((module) => ({ default: module.PatientCreatePage })),
);
export const PatientDetailPage = lazy(() =>
  import('@/pages/patient-detail-page').then((module) => ({ default: module.PatientDetailPage })),
);
export const PatientEditPage = lazy(() =>
  import('@/pages/patient-edit-page').then((module) => ({ default: module.PatientEditPage })),
);
export const PatientsPage = lazy(() =>
  import('@/pages/patients-page').then((module) => ({ default: module.PatientsPage })),
);
export const ProfilePage = lazy(() =>
  import('@/pages/profile-page').then((module) => ({ default: module.ProfilePage })),
);
export const UnauthorizedPage = lazy(() =>
  import('@/pages/unauthorized-page').then((module) => ({ default: module.UnauthorizedPage })),
);
