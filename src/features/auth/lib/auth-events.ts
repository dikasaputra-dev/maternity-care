const AUTH_UNAUTHORIZED_EVENT = 'maternity-care:auth-unauthorized';

export function emitUnauthorizedSession() {
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}

export function subscribeToUnauthorizedSession(listener: () => void) {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, listener);

  return () => {
    window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, listener);
  };
}
