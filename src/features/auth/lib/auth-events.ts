import type { AuthErrorReason } from '@/features/auth/types/auth.types';

const AUTH_UNAUTHORIZED_EVENT = 'maternity-care:unauthorized';

export interface UnauthorizedEventDetail {
  message: string;
  reason?: AuthErrorReason;
}

const DEFAULT_UNAUTHORIZED_MESSAGE = 'Sesi Anda telah berakhir. Silakan login kembali.';

export function emitUnauthorized(detail?: Partial<UnauthorizedEventDetail>) {
  window.dispatchEvent(
    new CustomEvent<UnauthorizedEventDetail>(AUTH_UNAUTHORIZED_EVENT, {
      detail: {
        message: detail?.message ?? DEFAULT_UNAUTHORIZED_MESSAGE,
        reason: detail?.reason,
      },
    }),
  );
}

export function onUnauthorized(callback: (detail: UnauthorizedEventDetail) => void) {
  function handleUnauthorized(event: Event) {
    const customEvent = event as CustomEvent<UnauthorizedEventDetail>;

    callback({
      message: customEvent.detail?.message ?? DEFAULT_UNAUTHORIZED_MESSAGE,
      reason: customEvent.detail?.reason,
    });
  }

  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

  return () => {
    window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  };
}
