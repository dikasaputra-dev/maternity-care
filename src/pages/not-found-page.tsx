import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  function handleOpenDashboard() {
    void navigate('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5 py-12">
      <div className="max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <SearchOffOutlinedIcon aria-hidden="true" fontSize="large" />
        </span>

        <p className="mt-6 text-sm font-semibold text-brand-600">404 Not Found</p>

        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Halaman tidak ditemukan</h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Alamat yang dibuka tidak tersedia atau telah dipindahkan.
        </p>

        <Button className="mt-6" onClick={handleOpenDashboard}>
          Buka Dashboard
        </Button>
      </div>
    </main>
  );
}
