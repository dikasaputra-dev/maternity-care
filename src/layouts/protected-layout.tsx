import { Outlet, useLocation, useNavigate } from 'react-router';

import { getAllowedNavigationItems, getPageTitle } from '@/app/router/navigation';
import { AuthNoticeBanner } from '@/features/auth/components/auth-notice-banner';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';
import { AppLayout } from '@/layouts/app-layout';

export function ProtectedLayout() {
  const { isLoggingOut, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const navigationItems = getAllowedNavigationItems(user);
  const title = getPageTitle(location.pathname);
  const canViewProfile = hasPermission(user, PERMISSIONS.PROFILE_VIEW);
  const canChangePassword = hasPermission(user, PERMISSIONS.PROFILE_CHANGE_PASSWORD);

  function handleProfile() {
    if (!canViewProfile) {
      void navigate('/unauthorized', {
        state: {
          from: '/profile',
          requiredPermission: PERMISSIONS.PROFILE_VIEW,
        },
      });

      return;
    }

    void navigate('/profile');
  }

  function handleChangePassword() {
    if (!canChangePassword) {
      void navigate('/unauthorized', {
        state: {
          from: '/profile/change-password',
          requiredPermission: PERMISSIONS.PROFILE_CHANGE_PASSWORD,
        },
      });

      return;
    }

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
      canViewProfile={canViewProfile}
      canChangePassword={canChangePassword}
      isLoggingOut={isLoggingOut}
      onProfile={handleProfile}
      onChangePassword={handleChangePassword}
      onLogout={handleLogout}
    >
      <AuthNoticeBanner />

      <Outlet />
    </AppLayout>
  );
}
