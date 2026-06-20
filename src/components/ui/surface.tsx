import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type CardPadding = 'none' | 'sm' | 'md';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

const cardPaddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
};

export function Card({ children, className, padding = 'md', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        cardPaddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const badgeToneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-sky-100 text-sky-800',
};

export function Badge({ children, className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex min-h-6 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        badgeToneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
