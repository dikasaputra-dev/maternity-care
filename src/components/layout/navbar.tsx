import MenuIcon from '@mui/icons-material/Menu';

import { ProfileDropdown, type ProfileUser } from '@/components/layout/profile-dropdown';

interface NavbarProps {
  title: string;
  user: ProfileUser;
  onMenuClick: () => void;
  onProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export function Navbar({
  onChangePassword,
  onLogout,
  onMenuClick,
  onProfile,
  title,
  user,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Buka navigasi"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
          >
            <MenuIcon aria-hidden="true" fontSize="small" />
          </button>

          <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">{title}</h1>
        </div>

        <ProfileDropdown
          user={user}
          onProfile={onProfile}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
