import { isPermission } from '@/features/auth/constants/permissions';
import type { AuthSession, AuthUser, Role } from '@/features/auth/types/auth.types';

const AUTH_SESSION_KEY = 'maternity-care.auth-session';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRole(value: unknown): value is Role {
  return value === 'nurse' || value === 'admin';
}

function parseAuthUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== 'number' ||
    typeof value.name !== 'string' ||
    !isRole(value.role) ||
    !Array.isArray(value.permissions)
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    nim: typeof value.nim === 'string' ? value.nim : null,
    email: typeof value.email === 'string' ? value.email : null,
    role: value.role,
    permissions: value.permissions.filter(isPermission),
  };
}

function parseAuthSession(value: unknown): AuthSession | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.accessToken !== 'string' || typeof value.tokenType !== 'string') {
    return null;
  }

  const user = parseAuthUser(value.user);

  if (!user) {
    return null;
  }

  return {
    accessToken: value.accessToken,
    tokenType: value.tokenType,
    user,
  };
}

export function getStoredAuthSession(): AuthSession | null {
  const rawValue = window.localStorage.getItem(AUTH_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return parseAuthSession(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

export function getStoredAccessToken() {
  return getStoredAuthSession()?.accessToken ?? null;
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}
