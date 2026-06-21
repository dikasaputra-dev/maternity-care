import { useState, type ReactNode } from 'react';

import { Navbar } from '@/components/layout/navbar';
import type { ProfileUser } from '@/components/layout/profile-dropdown';
import { Sidebar, type SidebarNavigationItem } from '@/components/layout/sidebar';

interface AppLayoutProps {
  title: string;
  user: ProfileUser;
  navigationItems: readonly SidebarNavigationItem[];
  children: ReactNode;
  canViewProfile: boolean;
  canChangePassword: boolean;
  isLoggingOut: boolean;
  onProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export function AppLayout({
  canChangePassword,
  canViewProfile,
  children,
  isLoggingOut,
  navigationItems,
  onChangePassword,
  onLogout,
  onProfile,
  title,
  user,
}: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        items={navigationItems}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-72">
        <Navbar
          title={title}
          user={user}
          canViewProfile={canViewProfile}
          canChangePassword={canChangePassword}
          isLoggingOut={isLoggingOut}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onProfile={onProfile}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
        />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
