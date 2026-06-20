import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  function handleBackToDashboard() {
    void navigate('/dashboard');
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <BlockOutlinedIcon aria-hidden="true" fontSize="large" />
        </span>

        <p className="mt-6 text-sm font-semibold text-red-600">403 Forbidden</p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Anda tidak memiliki izin</h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Akun yang sedang digunakan tidak memiliki permission untuk membuka halaman tersebut.
        </p>

        <Button className="mt-6" onClick={handleBackToDashboard}>
          Kembali ke Dashboard
        </Button>
      </div>
    </div>
  );
}
