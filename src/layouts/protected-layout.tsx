import { Outlet, useLocation } from 'react-router';

import { getPageTitle } from '@/app/router/navigation';
import { AppLayout } from '@/layouts/app-layout';

export function ProtectedLayout() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <AppLayout title={title}>
      <Outlet />
    </AppLayout>
  );
}
