import { Suspense } from 'react';
import { RouterProvider } from 'react-router';

import { appRouter } from '@/app/router/app-router';

export function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
          Memuat halaman...
        </div>
      }
    >
      <RouterProvider router={appRouter} />
    </Suspense>
  );
}
