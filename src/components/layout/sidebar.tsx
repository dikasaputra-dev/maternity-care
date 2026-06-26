import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { NavLink } from 'react-router';

import { APP_PATHS, type AppPath } from '@/app/router/route-metadata';
import { cn } from '@/lib/cn';

export interface SidebarNavigationItem {
  id: string;
  label: string;
  path: AppPath;
}

interface SidebarProps {
  items: readonly SidebarNavigationItem[];
  mobileOpen?: boolean;
  onClose?: () => void;
}

function getNavigationIcon(path: AppPath): SvgIconComponent | null {
  switch (path) {
    case APP_PATHS.DASHBOARD:
      return DashboardOutlinedIcon;

    case APP_PATHS.PATIENTS:
      return PeopleAltOutlinedIcon;

    case APP_PATHS.SCREENINGS:
      return FactCheckOutlinedIcon;

    case APP_PATHS.HISTORY:
      return HistoryOutlinedIcon;

    case APP_PATHS.REPORTS:
      return DescriptionOutlinedIcon;

    case APP_PATHS.STUDENTS:
      return GroupsOutlinedIcon;

    default:
      return null;
  }
}

export function Sidebar({ items, mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div>
          <p className="text-lg font-semibold text-slate-950">MaternityCare</p>

          <p className="mt-1 text-sm text-brand-700">Universitas Bhakti Kencana</p>
        </div>

        <nav className="mt-8 space-y-1">
          {items.map((item) => {
            const Icon = getNavigationIcon(item.path);

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === APP_PATHS.PATIENTS}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
                  )
                }
              >
                {Icon ? <Icon aria-hidden="true" fontSize="small" /> : null}

                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
