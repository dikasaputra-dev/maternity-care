import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/cn';

interface FieldMessageProps {
  id: string;
  hint?: string;
  error?: string;
}

function FieldMessage({ error, hint, id }: FieldMessageProps) {
  const message = error ?? hint;

  if (!message) {
    return null;
  }

  return (
    <p id={id} className={cn('text-sm', error ? 'font-medium text-red-600' : 'text-slate-500')}>
      {message}
    </p>
  );
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  className,
  containerClassName,
  error,
  hint,
  id,
  label,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const hasMessage = Boolean(error ?? hint);

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={hasMessage ? messageId : undefined}
        className={cn(
          'min-h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none',
          'placeholder:text-slate-400',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-slate-300',
          className,
        )}
      />

      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  containerClassName?: string;
}

export function Select({
  children,
  className,
  containerClassName,
  error,
  hint,
  id,
  label,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;
  const hasMessage = Boolean(error ?? hint);

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        {...props}
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={hasMessage ? messageId : undefined}
        className={cn(
          'min-h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-slate-300',
          className,
        )}
      >
        {children}
      </select>

      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function Textarea({
  className,
  containerClassName,
  error,
  hint,
  id,
  label,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const messageId = `${textareaId}-message`;
  const hasMessage = Boolean(error ?? hint);

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        {...props}
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={hasMessage ? messageId : undefined}
        className={cn(
          'w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none',
          'placeholder:text-slate-400',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-slate-300',
          className,
        )}
      />

      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  containerClassName?: string;
}

export function Checkbox({
  className,
  containerClassName,
  description,
  id,
  label,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const descriptionId = description ? `${checkboxId}-description` : undefined;

  return (
    <div className={cn('flex items-start gap-3', containerClassName)}>
      <input
        {...props}
        id={checkboxId}
        type="checkbox"
        aria-describedby={descriptionId}
        className={cn(
          'mt-0.5 h-5 w-5 rounded border-slate-300 accent-brand-600',
          'focus:ring-2 focus:ring-brand-200 focus:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
      />

      <div className="min-w-0">
        <label htmlFor={checkboxId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>

        {description ? (
          <p id={descriptionId} className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
