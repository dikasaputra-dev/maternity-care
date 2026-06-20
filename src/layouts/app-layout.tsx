import { useState, type ReactNode } from 'react';

import { Navbar } from '@/components/layout/navbar';
import type { ProfileUser } from '@/components/layout/profile-dropdown';
import { Sidebar, type SidebarNavigationItem } from '@/components/layout/sidebar';

interface AppLayoutProps {
  title: string;
  user: ProfileUser;
  navigationItems: SidebarNavigationItem[];
  activeItemId: string;
  children: ReactNode;
  onNavigate: (itemId: string) => void;
  onProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export function AppLayout({
  activeItemId,
  children,
  navigationItems,
  onChangePassword,
  onLogout,
  onNavigate,
  onProfile,
  title,
  user,
}: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        items={navigationItems}
        activeItemId={activeItemId}
        mobileOpen={mobileSidebarOpen}
        onNavigate={onNavigate}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-72">
        <Navbar
          title={title}
          user={user}
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
