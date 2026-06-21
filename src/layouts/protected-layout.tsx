import { Outlet, useLocation, useNavigate } from 'react-router';

import { getAllowedNavigationItems, getPageTitle } from '@/app/router/navigation';
import { AuthNoticeBanner } from '@/features/auth/components/auth-notice-banner';
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
      <AuthNoticeBanner />

      <Outlet />
    </AppLayout>
  );
}
