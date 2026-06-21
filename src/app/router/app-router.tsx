import { createBrowserRouter } from 'react-router';

import { AuthenticatedIndexRoute } from '@/features/auth/components/authenticated-index-route';
import { PublicOnlyRoute } from '@/features/auth/components/public-only-route';
import { RequireAuth } from '@/features/auth/components/require-auth';
import { RequirePermission } from '@/features/auth/components/require-permission';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { ProtectedLayout } from '@/layouts/protected-layout';
import { DashboardPage } from '@/pages/dashboard-page';
import { LoginPage } from '@/pages/login-page';
import { ModulePreviewPage } from '@/pages/module-preview-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { UnauthorizedPage } from '@/pages/unauthorized-page';

export const appRouter = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
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
            path: '/',
            element: <AuthenticatedIndexRoute />,
          },
          {
            path: '/dashboard',
            element: (
              <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
                <DashboardPage />
              </RequirePermission>
            ),
          },
          {
            path: '/patients',
            element: (
              <RequirePermission permission={PERMISSIONS.PATIENTS_LIST}>
                <ModulePreviewPage
                  title="Pasien"
                  description="Daftar pasien akan dibangun setelah kontrak Patient API tersedia."
                  requiredPermission={PERMISSIONS.PATIENTS_LIST}
                  actionPermission={PERMISSIONS.PATIENTS_CREATE}
                  actionDescription="User memiliki izin untuk menambahkan pasien."
                />
              </RequirePermission>
            ),
          },
          {
            path: '/screenings',
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
            path: '/history',
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
            path: '/reports',
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
            path: '/profile',
            element: (
              <RequirePermission permission={PERMISSIONS.PROFILE_VIEW}>
                <ModulePreviewPage
                  title="Profil"
                  description="Profil menggunakan data user dari endpoint GET /api/me."
                  requiredPermission={PERMISSIONS.PROFILE_VIEW}
                />
              </RequirePermission>
            ),
          },
          {
            path: '/profile/change-password',
            element: (
              <RequirePermission permission={PERMISSIONS.PROFILE_CHANGE_PASSWORD}>
                <ModulePreviewPage
                  title="Ganti Password"
                  description="Form akan menggunakan endpoint PATCH /api/me/password."
                  requiredPermission={PERMISSIONS.PROFILE_CHANGE_PASSWORD}
                />
              </RequirePermission>
            ),
          },
          {
            path: '/admin/students',
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
            path: '/unauthorized',
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
