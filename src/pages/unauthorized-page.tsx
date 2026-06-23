import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useLocation, useNavigate } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import { getDefaultAuthenticatedPath } from '@/app/router/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface UnauthorizedState {
  requiredPermission?: string;
  from?: string;
}

function parseUnauthorizedState(value: unknown): UnauthorizedState {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const state = value as Record<string, unknown>;

  return {
    requiredPermission:
      typeof state.requiredPermission === 'string' ? state.requiredPermission : undefined,
    from: typeof state.from === 'string' ? state.from : undefined,
  };
}

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const state = parseUnauthorizedState(location.state);

  function handleBack() {
    if (user) {
      void navigate(getDefaultAuthenticatedPath(user), {
        replace: true,
      });

      return;
    }

    void navigate(APP_PATHS.LOGIN, {
      replace: true,
    });
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <LockOutlinedIcon aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-slate-950">Akses ditolak</h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Akun Anda tidak memiliki izin untuk membuka halaman atau aksi ini.
        </p>

        {state.requiredPermission ? (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
            Permission dibutuhkan: {state.requiredPermission}
          </p>
        ) : null}

        <Button className="mt-6" onClick={handleBack}>
          Kembali
        </Button>
      </Card>
    </div>
  );
}
