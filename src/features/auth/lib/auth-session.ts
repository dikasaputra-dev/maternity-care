import { isPermission } from '@/features/auth/constants/permissions';
import type { AuthSession, AuthUser, Role } from '@/features/auth/types/auth.types';

const AUTH_SESSION_KEY = 'maternity-care.auth-session';

/**
 * Storage utama auth memakai localStorage agar session bisa dipakai lintas tab.
 *
 * Alasan:
 * - Jika user login di Tab A, lalu membuka Tab B ke / atau /login,
 *   frontend tetap bisa membaca session dan redirect ke dashboard.
 * - Validasi keamanan tetap dikontrol backend melalui expiresAt, idle timeout,
 *   dan single active session.
 */
const authStorage = window.localStorage;

/**
 * SessionStorage dibersihkan sebagai legacy dari implementasi sebelumnya.
 */
const legacySessionStorage = window.sessionStorage;

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

  if (
    typeof value.accessToken !== 'string' ||
    value.tokenType !== 'Bearer' ||
    typeof value.expiresAt !== 'string' ||
    typeof value.idleTimeoutMinutes !== 'number'
  ) {
    return null;
  }

  const user = parseAuthUser(value.user);

  if (!user) {
    return null;
  }

  return {
    accessToken: value.accessToken,
    tokenType: value.tokenType,
    expiresAt: value.expiresAt,
    idleTimeoutMinutes: value.idleTimeoutMinutes,
    user,
  };
}

export function getStoredAuthSession(): AuthSession | null {
  const rawValue = authStorage.getItem(AUTH_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedSession = parseAuthSession(JSON.parse(rawValue));

    if (!parsedSession) {
      clearAuthSession();
      return null;
    }

    return parsedSession;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function getStoredAccessToken() {
  return getStoredAuthSession()?.accessToken ?? null;
}

export function getStoredTokenType() {
  return getStoredAuthSession()?.tokenType ?? 'Bearer';
}

export function getStoredAuthSessionExpiresAt() {
  return getStoredAuthSession()?.expiresAt ?? null;
}

export function getStoredAuthSessionIdleTimeoutMinutes() {
  return getStoredAuthSession()?.idleTimeoutMinutes ?? null;
}

export function isAuthSessionExpired(session: AuthSession | null | undefined) {
  if (!session?.expiresAt) {
    return false;
  }

  const expiresAtTime = new Date(session.expiresAt).getTime();

  if (Number.isNaN(expiresAtTime)) {
    return false;
  }

  return Date.now() >= expiresAtTime;
}

export function isStoredAuthSessionExpired() {
  return isAuthSessionExpired(getStoredAuthSession());
}

export function saveAuthSession(session: AuthSession) {
  authStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));

  /**
   * Pastikan session lama dari sessionStorage tidak tersisa.
   */
  legacySessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function clearAuthSession() {
  authStorage.removeItem(AUTH_SESSION_KEY);
  legacySessionStorage.removeItem(AUTH_SESSION_KEY);
}
