import { Outlet, useLocation, useNavigate } from 'react-router';

import { getAllowedNavigationItems, getPageTitle } from '@/app/router/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AppLayout } from '@/layouts/app-layout';

export function ProtectedLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const navigationItems = getAllowedNavigationItems(user);
  const title = getPageTitle(location.pathname);

  function handleProfile() {
    void navigate('/profile');
  }

  function handleChangePassword() {
    void navigate('/profile/change-password');
  }

  function handleLogout() {
    logout();

    void navigate('/login', {
      replace: true,
    });
  }

  return (
    <AppLayout
      title={title}
      user={{
        name: user.name,
        role: user.role === 'nurse' ? 'Nurse' : 'Admin',
      }}
      navigationItems={navigationItems}
      onProfile={handleProfile}
      onChangePassword={handleChangePassword}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  );
}
