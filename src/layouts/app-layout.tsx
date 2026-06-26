import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { APP_PATHS } from '@/app/router/route-metadata';
import { getAllowedNavigationItems } from '@/app/router/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { PERMISSIONS } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/lib/authorization';

interface AppLayoutProps {
  title: string;
  children: ReactNode;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const navigate = useNavigate();
  const { isLoggingOut, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return null;
  }

  const navigationItems = getAllowedNavigationItems(user);

  const canViewProfile = hasPermission(user, PERMISSIONS.PROFILE_VIEW);

  const canChangePassword = hasPermission(user, PERMISSIONS.PROFILE_CHANGE_PASSWORD);

  function openSidebar() {
    setMobileOpen(true);
  }

  function closeSidebar() {
    setMobileOpen(false);
  }

  function handleProfile() {
    void navigate(APP_PATHS.PROFILE);
  }

  function handleChangePassword() {
    void navigate(APP_PATHS.CHANGE_PASSWORD);
  }

  function handleLogout() {
    void logout();
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex min-h-screen">
        <Sidebar items={navigationItems} mobileOpen={mobileOpen} onClose={closeSidebar} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            title={title}
            user={user}
            canViewProfile={canViewProfile}
            canChangePassword={canChangePassword}
            isLoggingOut={isLoggingOut}
            onMenuClick={openSidebar}
            onProfile={handleProfile}
            onChangePassword={handleChangePassword}
            onLogout={handleLogout}
          />

          <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
