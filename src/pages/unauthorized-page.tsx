import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { useLocation, useNavigate } from 'react-router';

import {
  canAccessProtectedPath,
  getDefaultAuthenticatedPath,
  getRequiredPermissionForPath,
} from '@/app/router/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface UnauthorizedLocationState {
  from?: string;
  requiredPermission?: string;
}

export function UnauthorizedPage() {
  const { isRefreshingUser, logout, refreshUser, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as UnauthorizedLocationState | null;
  const inferredPermission = state?.from ? getRequiredPermissionForPath(state.from) : null;

  const requiredPermission = state?.requiredPermission ?? inferredPermission ?? null;

  const defaultPath = user ? getDefaultAuthenticatedPath(user) : '/login';
  const hasAvailablePage = defaultPath !== '/unauthorized';

  async function performAccessSync() {
    const synchronizedUser = await refreshUser();

    if (!synchronizedUser) {
      return;
    }

    const requestedPath = state?.from;

    const destination =
      requestedPath && canAccessProtectedPath(synchronizedUser, requestedPath)
        ? requestedPath
        : getDefaultAuthenticatedPath(synchronizedUser);

    await navigate(destination, {
      replace: true,
    });
  }

  function handleAccessSync() {
    void performAccessSync();
  }

  function handleAvailablePage() {
    void navigate(defaultPath, {
      replace: true,
    });
  }

  async function performLogout() {
    await logout();

    await navigate('/login', {
      replace: true,
    });
  }

  function handleLogout() {
    void performLogout();
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <BlockOutlinedIcon aria-hidden="true" fontSize="large" />
        </span>

        <p className="mt-6 text-sm font-semibold text-red-600">403 Forbidden</p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Anda tidak memiliki izin</h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Akun yang sedang digunakan tidak memiliki permission untuk membuka halaman tersebut.
        </p>

        {requiredPermission ? (
          <div className="mt-5 rounded-lg border border-red-100 bg-red-50/60 px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Permission dibutuhkan
            </p>

            <p className="mt-1 text-sm text-red-800">{requiredPermission}</p>

            {state?.from ? (
              <p className="mt-2 break-all text-xs text-red-600">Route: {state.from}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button isLoading={isRefreshingUser} onClick={handleAccessSync}>
            Sinkronkan Ulang Akses
          </Button>

          {hasAvailablePage ? (
            <Button variant="secondary" onClick={handleAvailablePage}>
              Buka Halaman Tersedia
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleLogout}>
              Keluar dari Akun
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
