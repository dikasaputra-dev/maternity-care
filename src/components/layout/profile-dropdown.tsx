import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import { useEffect, useId, useRef, useState } from 'react';

export interface ProfileUser {
  name: string;
  role: string;
}

interface ProfileDropdownProps {
  user: ProfileUser;
  onProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'U';
}

export function ProfileDropdown({
  onChangePassword,
  onLogout,
  onProfile,
  user,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials = getInitials(user.name);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function runAction(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
          {initials}
        </span>

        <ExpandMoreIcon
          aria-hidden="true"
          fontSize="small"
          className="hidden text-slate-500 sm:block"
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>

            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              {user.role}
            </p>
          </div>

          <div className="p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onProfile)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <PersonOutlineIcon aria-hidden="true" fontSize="small" />
              Profil
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onChangePassword)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <KeyOutlinedIcon aria-hidden="true" fontSize="small" />
              Ganti Password
            </button>
          </div>

          <div className="border-t border-slate-200 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onLogout)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <LogoutIcon aria-hidden="true" fontSize="small" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
