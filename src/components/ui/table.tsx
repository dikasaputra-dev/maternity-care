import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/cn';

interface TableProps extends ComponentPropsWithoutRef<'table'> {
  containerClassName?: string;
}

export function Table({ className, containerClassName, ...props }: TableProps) {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-slate-200 bg-white',
        containerClassName,
      )}
    >
      <table {...props} className={cn('min-w-full border-collapse text-left text-sm', className)} />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentPropsWithoutRef<'thead'>) {
  return <thead {...props} className={cn('bg-slate-50', className)} />;
}

export function TableBody({ className, ...props }: ComponentPropsWithoutRef<'tbody'>) {
  return <tbody {...props} className={cn('divide-y divide-slate-200', className)} />;
}

export function TableRow({ className, ...props }: ComponentPropsWithoutRef<'tr'>) {
  return <tr {...props} className={cn('transition-colors hover:bg-slate-50/80', className)} />;
}

export function TableHead({ className, ...props }: ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      {...props}
      className={cn(
        'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600',
        className,
      )}
    />
  );
}

export function TableCell({ className, ...props }: ComponentPropsWithoutRef<'td'>) {
  return (
    <td {...props} className={cn('whitespace-nowrap px-4 py-3.5 text-slate-700', className)} />
  );
}
