import { createBrowserRouter, Navigate } from 'react-router';

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
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
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
                  actionDescription="User dapat melihat action Tambah Pasien ketika Patient Domain mulai dibuat."
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
                  description="Directory skrining akan menggunakan permission dari Laravel API."
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
                  description="Untuk Nurse, backend harus membatasi hasil hanya pada data miliknya sendiri."
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
                  description="Laporan pasien akan tersedia setelah Patient, Screening, dan Monitoring Domain selesai."
                  requiredPermission={PERMISSIONS.REPORTS_VIEW}
                  actionPermission={PERMISSIONS.REPORTS_EXPORT}
                  actionDescription="User memiliki izin untuk mengekspor rekap laporan."
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
                  description="Halaman profil akan menampilkan informasi user dari endpoint GET /api/me."
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
                  description="Form ganti password akan menggunakan endpoint PATCH /api/me/password."
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
                  description="Route ini hanya dapat dibuka oleh user yang memiliki permission students.list."
                  requiredPermission={PERMISSIONS.STUDENTS_LIST}
                  actionPermission={PERMISSIONS.STUDENTS_CREATE}
                  actionDescription="User dapat menambahkan akun mahasiswa atau Nurse."
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
