import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export function Modal({ children, description, footer, onClose, open, title }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const focusTimeout = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimeout);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-950">
              {title}
            </h2>

            {description ? (
              <p id={descriptionId} className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Tutup modal"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
          >
            <CloseIcon aria-hidden="true" fontSize="small" />
          </button>
        </header>

        <div className="px-5 py-5">{children}</div>

        {footer ? (
          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
