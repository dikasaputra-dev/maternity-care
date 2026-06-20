import { isPermission } from '@/features/auth/constants/permissions';
import type { AuthRole, AuthSession, AuthUser } from '@/features/auth/types/auth.types';

const AUTH_SESSION_KEY = 'maternity-care.auth-session';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

function isAuthRole(value: unknown): value is AuthRole {
  return value === 'nurse' || value === 'admin';
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    isNullableString(value.nim) &&
    isNullableString(value.email) &&
    isAuthRole(value.role) &&
    Array.isArray(value.permissions) &&
    value.permissions.every(isPermission)
  );
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.accessToken === 'string' && value.tokenType === 'Bearer' && isAuthUser(value.user)
  );
}

export function readAuthSession(): AuthSession | null {
  const storedSession = sessionStorage.getItem(AUTH_SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const parsedSession: unknown = JSON.parse(storedSession);

    if (!isAuthSession(parsedSession)) {
      sessionStorage.removeItem(AUTH_SESSION_KEY);

      return null;
    }

    return parsedSession;
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY);

    return null;
  }
}

export function writeAuthSession(session: AuthSession) {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}
