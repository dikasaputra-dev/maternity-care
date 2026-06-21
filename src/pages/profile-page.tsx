import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/surface';
import { PermissionGate } from '@/features/auth/components/permission-gate';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { createRbacSnapshot } from '@/features/auth/lib/rbac-testing';

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Belum disinkronkan';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function ProfilePage() {
  const { isRefreshingUser, lastSyncedAt, refreshUser, user } = useAuth();
  const navigate = useNavigate();

  const rbacSnapshot = useMemo(() => {
    if (!user) {
      return null;
    }

    return createRbacSnapshot(user);
  }, [user]);

  if (!user || !rbacSnapshot) {
    return null;
  }

  function handleChangePassword() {
    void navigate('/profile/change-password');
  }

  async function performRefresh() {
    await refreshUser();
  }

  function handleRefresh() {
    void performRefresh();
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-brand-600">Profil Pengguna</p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Informasi akun
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Data profil, role, permission, dan akses route berasal dari session yang disinkronkan
          dengan backend.
        </p>
      </section>

      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <PersonOutlineIcon aria-hidden="true" />
            </span>

            <div>
              <h3 className="text-lg font-semibold text-slate-950">{user.name}</h3>

              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="info">{user.role === 'nurse' ? 'Nurse' : 'Admin'}</Badge>

                <Badge tone="success">Authenticated</Badge>
              </div>
            </div>
          </div>

          <PermissionGate permission={PERMISSIONS.PROFILE_CHANGE_PASSWORD}>
            <Button
              leadingIcon={<KeyOutlinedIcon aria-hidden="true" fontSize="small" />}
              onClick={handleChangePassword}
            >
              Ganti Password
            </Button>
          </PermissionGate>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold text-slate-950">Detail akun</h3>

          <dl className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <BadgeOutlinedIcon
                aria-hidden="true"
                fontSize="small"
                className="mt-0.5 text-brand-600"
              />

              <div>
                <dt className="text-sm font-medium text-slate-500">NIM</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{user.nim ?? '-'}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <EmailOutlinedIcon
                aria-hidden="true"
                fontSize="small"
                className="mt-0.5 text-brand-600"
              />

              <div>
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{user.email ?? '-'}</dd>
              </div>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-slate-950">Sinkronisasi akses</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sinkronisasi memastikan role dan permission terbaru sudah sesuai dengan backend.
          </p>

          <p className="mt-4 text-sm text-slate-700">
            Terakhir sinkron: <span className="font-semibold">{formatDateTime(lastSyncedAt)}</span>
          </p>

          <Button
            variant="secondary"
            className="mt-5"
            isLoading={isRefreshingUser}
            leadingIcon={<SyncOutlinedIcon aria-hidden="true" fontSize="small" />}
            onClick={handleRefresh}
          >
            Sinkronkan Ulang
          </Button>
        </Card>
      </section>

      <Card>
        <h3 className="text-base font-semibold text-slate-950">Ringkasan RBAC</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ringkasan ini membantu mengecek apakah permission user sudah sesuai dengan route yang
          tersedia di frontend.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Permission
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {rbacSnapshot.totalPermissions}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Route Diizinkan
            </p>

            <p className="mt-2 text-2xl font-semibold text-emerald-800">
              {rbacSnapshot.allowedRouteCount}
            </p>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Route Ditolak
            </p>

            <p className="mt-2 text-2xl font-semibold text-red-800">
              {rbacSnapshot.deniedRouteCount}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-800">Menu yang tersedia</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {rbacSnapshot.allowedNavigationLabels.map((label) => (
              <Badge key={label} tone="info">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-slate-950">Permission aktif</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Frontend menggunakan permission ini untuk sidebar, route, dan action. Backend tetap
          menjadi lapisan keamanan utama.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {user.permissions.map((permission) => (
            <Badge key={permission} tone="neutral">
              {permission}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
