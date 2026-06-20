import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/surface';
import { PermissionGate } from '@/features/auth/components/permission-gate';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const roleLabel = user.role === 'nurse' ? 'Nurse' : 'Admin';

  function handleOpenPatients() {
    void navigate('/patients');
  }

  function handleOpenStudents() {
    void navigate('/admin/students');
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold text-brand-600">Frontend RBAC</p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Selamat datang, {user.name}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Menu, route, dan action pada halaman ini mengikuti permission dari session pengguna.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Role Aktif</p>

              <p className="mt-3 text-2xl font-semibold text-slate-950">{roleLabel}</p>
            </div>

            <span className="rounded-xl bg-brand-50 p-3 text-brand-700">
              <AdminPanelSettingsOutlinedIcon aria-hidden="true" />
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Permission</p>

              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {user.permissions.length}
              </p>
            </div>

            <span className="rounded-xl bg-brand-50 p-3 text-brand-700">
              <KeyOutlinedIcon aria-hidden="true" />
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Status Session</p>

              <div className="mt-3">
                <Badge tone="success">Authenticated</Badge>
              </div>
            </div>

            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <VerifiedUserOutlinedIcon aria-hidden="true" />
            </span>
          </div>
        </Card>
      </section>

      <section className="rounded-xl border border-brand-100 bg-white p-5 sm:p-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Permission-based actions</h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Action berikut hanya muncul ketika user memiliki permission yang dibutuhkan.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <PermissionGate permission={PERMISSIONS.PATIENTS_LIST}>
            <Button onClick={handleOpenPatients}>Buka Pasien</Button>
          </PermissionGate>

          <PermissionGate permission={PERMISSIONS.STUDENTS_LIST}>
            <Button variant="secondary" onClick={handleOpenStudents}>
              Kelola Mahasiswa
            </Button>
          </PermissionGate>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-950">Permission pengguna</h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {user.permissions.map((permission) => (
            <Badge key={permission} tone="info">
              {permission}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
