import CloseIcon from '@mui/icons-material/Close';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ElementType } from 'react';

import { cn } from '@/lib/cn';

export interface SidebarNavigationItem {
  id: string;
  label: string;
  icon: ElementType<SvgIconProps>;
}

interface SidebarProps {
  items: SidebarNavigationItem[];
  activeItemId: string;
  mobileOpen: boolean;
  onNavigate: (itemId: string) => void;
  onMobileClose: () => void;
}

interface SidebarPanelProps {
  items: SidebarNavigationItem[];
  activeItemId: string;
  showCloseButton?: boolean;
  onNavigate: (itemId: string) => void;
  onClose: () => void;
}

function SidebarPanel({
  activeItemId,
  items,
  onClose,
  onNavigate,
  showCloseButton = false,
}: SidebarPanelProps) {
  return (
    <div className="flex h-full flex-col bg-white text-slate-900">
      <div className="flex min-h-16 items-center justify-between border-b border-brand-100 px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-300 text-brand-950 shadow-sm">
            <MonitorHeartOutlinedIcon aria-hidden="true" fontSize="small" />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-900">MaternityCare</p>

            <p className="text-xs text-brand-600">Clinical Workspace</p>
          </div>
        </div>

        {showCloseButton ? (
          <button
            type="button"
            aria-label="Tutup navigasi"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <CloseIcon aria-hidden="true" fontSize="small" />
          </button>
        ) : null}
      </div>

      <nav aria-label="Navigasi utama" className="flex-1 space-y-1.5 overflow-y-auto p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItemId;

          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={cn(
                'flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 text-left text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                isActive
                  ? 'border-brand-200 bg-brand-50 text-brand-700 shadow-sm'
                  : 'border-transparent text-slate-600 hover:border-brand-100 hover:bg-brand-50/70 hover:text-brand-700',
              )}
            >
              <Icon aria-hidden="true" fontSize="small" />

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-brand-100 bg-brand-50/40 px-5 py-4">
        <p className="text-xs leading-5 text-slate-500">
          Akses menu mengikuti role dan permission dari backend.
        </p>
      </div>
    </div>
  );
}

export function Sidebar({
  activeItemId,
  items,
  mobileOpen,
  onMobileClose,
  onNavigate,
}: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-brand-100 bg-white lg:block">
        <SidebarPanel
          items={items}
          activeItemId={activeItemId}
          onNavigate={onNavigate}
          onClose={onMobileClose}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup navigasi"
            onClick={onMobileClose}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
          />

          <aside className="relative h-full w-[min(18rem,85vw)] border-r border-brand-100 bg-white shadow-xl">
            <SidebarPanel
              items={items}
              activeItemId={activeItemId}
              showCloseButton
              onNavigate={onNavigate}
              onClose={onMobileClose}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
