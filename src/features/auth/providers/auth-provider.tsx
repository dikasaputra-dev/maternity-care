import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { ApiError } from '@/api/api-error';
import { AuthContext, type AuthContextValue } from '@/features/auth/context/auth-context';
import { onUnauthorized } from '@/features/auth/lib/auth-events';
import {
  clearAuthSession,
  getStoredAuthSession,
  isAuthSessionExpired,
  saveAuthSession,
} from '@/features/auth/lib/auth-session';
import {
  changePassword,
  getAuthenticatedUser,
  loginAdmin,
  loginNurse,
  logout,
} from '@/features/auth/services/auth.service';
import type {
  AdminLoginPayload,
  AuthSession,
  ChangePasswordPayload,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

interface AuthProviderProps {
  children: ReactNode;
}

const SESSION_EXPIRED_MESSAGE = 'Sesi Anda telah berakhir. Silakan login kembali.';
const SESSION_RESTORE_FAILED_MESSAGE = 'Sesi tidak dapat dipulihkan. Silakan login kembali.';

function getSessionRestoreErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    return error.message || SESSION_EXPIRED_MESSAGE;
  }

  return SESSION_RESTORE_FAILED_MESSAGE;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession());

  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshingUser, setIsRefreshingUser] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const user = session?.user ?? null;

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedSession = getStoredAuthSession();

    if (!storedSession) {
      setSession(null);
      setLastSyncedAt(null);

      return null;
    }

    if (isAuthSessionExpired(storedSession)) {
      clearAuthSession();
      setSession(null);
      setLastSyncedAt(null);
      setAuthNotice(SESSION_EXPIRED_MESSAGE);

      return null;
    }

    setIsRefreshingUser(true);

    try {
      const syncedUser = await getAuthenticatedUser(storedSession.user.role);

      const nextSession: AuthSession = {
        ...storedSession,
        user: syncedUser,
      };

      saveAuthSession(nextSession);
      setSession(nextSession);
      setLastSyncedAt(new Date().toISOString());
      setAuthNotice(null);

      return syncedUser;
    } finally {
      setIsRefreshingUser(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function bootstrapSession() {
      const storedSession = getStoredAuthSession();

      if (!storedSession) {
        if (isActive) {
          setSession(null);
          setLastSyncedAt(null);
          setLoading(false);
        }

        return;
      }

      if (isAuthSessionExpired(storedSession)) {
        clearAuthSession();

        if (isActive) {
          setSession(null);
          setLastSyncedAt(null);
          setAuthNotice(SESSION_EXPIRED_MESSAGE);
          setLoading(false);
        }

        return;
      }

      try {
        const syncedUser = await getAuthenticatedUser(storedSession.user.role);

        if (!isActive) {
          return;
        }

        const nextSession: AuthSession = {
          ...storedSession,
          user: syncedUser,
        };

        saveAuthSession(nextSession);
        setSession(nextSession);
        setLastSyncedAt(new Date().toISOString());
        setAuthNotice(null);
      } catch (error: unknown) {
        clearAuthSession();

        if (isActive) {
          setSession(null);
          setLastSyncedAt(null);
          setAuthNotice(getSessionRestoreErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    return onUnauthorized(({ message }) => {
      clearAuthSession();
      setSession(null);
      setLastSyncedAt(null);
      setIsLoggingOut(false);
      setIsRefreshingUser(false);
      setAuthNotice(message);
    });
  }, []);

  async function handleLoginNurse(payload: NurseLoginPayload) {
    const nextSession = await loginNurse(payload);

    saveAuthSession(nextSession);
    setSession(nextSession);
    setLastSyncedAt(new Date().toISOString());
    setAuthNotice(null);

    return nextSession.user;
  }

  async function handleLoginAdmin(payload: AdminLoginPayload) {
    const nextSession = await loginAdmin(payload);

    saveAuthSession(nextSession);
    setSession(nextSession);
    setLastSyncedAt(new Date().toISOString());
    setAuthNotice(null);

    return nextSession.user;
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // Token expired tetap harus membersihkan session lokal.
      // Tidak perlu menampilkan pesan session expired saat user memang klik logout.
    } finally {
      clearAuthSession();
      setSession(null);
      setLastSyncedAt(null);
      setAuthNotice(null);
      setIsLoggingOut(false);
    }
  }

  async function handleChangePassword(payload: ChangePasswordPayload) {
    return changePassword(payload);
  }

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isLoggingOut,
    isRefreshingUser,
    lastSyncedAt,
    authNotice,

    loginNurse: handleLoginNurse,
    loginAdmin: handleLoginAdmin,

    loginAsNurse: handleLoginNurse,
    loginAsAdmin: handleLoginAdmin,

    logout: handleLogout,
    changePassword: handleChangePassword,
    refreshUser,
    clearAuthNotice,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
