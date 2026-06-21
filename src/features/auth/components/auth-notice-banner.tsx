import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function AuthNoticeBanner() {
  const { authNotice, isRefreshingUser, refreshUser } = useAuth();

  if (!authNotice && !isRefreshingUser) {
    return null;
  }

  async function performRefresh() {
    await refreshUser();
  }

  function handleRefresh() {
    void performRefresh();
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <SyncOutlinedIcon
          aria-hidden="true"
          fontSize="small"
          className={
            isRefreshingUser ? 'mt-0.5 animate-spin text-amber-700' : 'mt-0.5 text-amber-700'
          }
        />

        <div>
          <p className="text-sm font-semibold text-amber-900">
            {isRefreshingUser ? 'Menyinkronkan hak akses' : 'Sinkronisasi akses diperlukan'}
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            {isRefreshingUser ? 'Role dan permission terbaru sedang diperiksa.' : authNotice}
          </p>
        </div>
      </div>

      {!isRefreshingUser ? (
        <Button variant="secondary" size="sm" onClick={handleRefresh} className="shrink-0">
          Sinkronkan Ulang
        </Button>
      ) : null}
    </div>
  );
}
