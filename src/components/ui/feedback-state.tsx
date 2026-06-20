import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <InboxOutlinedIcon aria-hidden="true" fontSize="medium" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface LoadingStateProps {
  rows?: number;
  label?: string;
}

export function LoadingState({ label = 'Memuat data', rows = 4 }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
    >
      <span className="sr-only">{label}</span>

      <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="grid animate-pulse grid-cols-[2fr_1fr_1fr] gap-4">
          <div className="h-10 rounded bg-slate-100" />
          <div className="h-10 rounded bg-slate-100" />
          <div className="h-10 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
