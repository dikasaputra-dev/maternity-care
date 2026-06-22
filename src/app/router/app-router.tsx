import { createBrowserRouter } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import { AuthenticatedIndexRoute } from '@/features/auth/components/authenticated-index-route';
import { PublicOnlyRoute } from '@/features/auth/components/public-only-route';
import { RequireAuth } from '@/features/auth/components/require-auth';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { ProtectedLayout } from '@/layouts/protected-layout';
import { ChangePasswordPage } from '@/pages/change-password-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { LoginPage } from '@/pages/login-page';
import { ModulePreviewPage } from '@/pages/module-preview-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { ProfilePage } from '@/pages/profile-page';
import { UnauthorizedPage } from '@/pages/unauthorized-page';
import { PatientsPage } from '@/pages/patients-page';
import { PatientDetailPage } from '@/pages/patient-detail-page';
import { PatientCreatePage } from '@/pages/patient-create-page';

export const appRouter = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: APP_PATHS.LOGIN,
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: APP_PATHS.ROOT,
            element: <AuthenticatedIndexRoute />,
          },
          {
            path: APP_PATHS.DASHBOARD,
            element: (
              <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
                <DashboardPage />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.PATIENTS,
            element: (
              <RequirePermission permission={PERMISSIONS.PATIENTS_LIST}>
                <PatientsPage />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.PATIENT_CREATE,
            element: (
              <RequirePermission permission={PERMISSIONS.PATIENTS_CREATE}>
                <PatientCreatePage />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.PATIENT_DETAIL,
            element: (
              <RequirePermission permission={PERMISSIONS.PATIENTS_VIEW}>
                <PatientDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.SCREENINGS,
            element: (
              <RequirePermission permission={PERMISSIONS.SCREENINGS_LIST}>
                <ModulePreviewPage
                  title="Skrining"
                  description="Directory skrining menggunakan permission dari Laravel API."
                  requiredPermission={PERMISSIONS.SCREENINGS_LIST}
                  actionPermission={PERMISSIONS.SCREENINGS_CREATE}
                  actionDescription="User memiliki izin untuk membuat skrining baru."
                />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.HISTORY,
            element: (
              <RequirePermission permission={PERMISSIONS.HISTORY_VIEW_OWN}>
                <ModulePreviewPage
                  title="Riwayat"
                  description="Backend wajib membatasi riwayat Nurse hanya pada data miliknya."
                  requiredPermission={PERMISSIONS.HISTORY_VIEW_OWN}
                />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.REPORTS,
            element: (
              <RequirePermission permission={PERMISSIONS.REPORTS_VIEW}>
                <ModulePreviewPage
                  title="Laporan"
                  description="Laporan pasien mengikuti permission yang dikirim backend."
                  requiredPermission={PERMISSIONS.REPORTS_VIEW}
                  actionPermission={PERMISSIONS.REPORTS_EXPORT}
                  actionDescription="User memiliki izin untuk mengekspor laporan."
                />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.PROFILE,
            element: (
              <RequirePermission permission={PERMISSIONS.PROFILE_VIEW}>
                <ProfilePage />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.CHANGE_PASSWORD,
            element: (
              <RequirePermission permission={PERMISSIONS.PROFILE_CHANGE_PASSWORD}>
                <ChangePasswordPage />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.STUDENTS,
            element: (
              <RequirePermission permission={PERMISSIONS.STUDENTS_LIST}>
                <ModulePreviewPage
                  title="Data Mahasiswa"
                  description="Route hanya dapat dibuka oleh user dengan students.list."
                  requiredPermission={PERMISSIONS.STUDENTS_LIST}
                  actionPermission={PERMISSIONS.STUDENTS_CREATE}
                  actionDescription="User memiliki izin untuk menambahkan akun mahasiswa."
                />
              </RequirePermission>
            ),
          },
          {
            path: APP_PATHS.UNAUTHORIZED,
            element: <UnauthorizedPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
