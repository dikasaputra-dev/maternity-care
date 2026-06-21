import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { ApiError } from '@/api/api-error';
import { AuthContext } from '@/features/auth/context/auth-context';
import { subscribeToUnauthorizedSession } from '@/features/auth/lib/auth-events';
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from '@/features/auth/lib/auth-session';
import { authService } from '@/features/auth/services/auth.service';
import type {
  AdminLoginPayload,
  AuthRole,
  AuthSession,
  AuthUser,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

type UserSyncReason = 'initial' | 'background' | 'manual';

const SESSION_EXPIRED_MESSAGE = 'Sesi Anda telah berakhir. Silakan masuk kembali.';

const ACCOUNT_ACCESS_REVOKED_MESSAGE = 'Akun Anda tidak lagi memiliki akses ke aplikasi.';

const SESSION_VERIFICATION_MESSAGE = 'Sesi tidak dapat diverifikasi. Silakan masuk kembali.';

const PERMISSION_SYNC_FAILED_MESSAGE =
  'Hak akses terbaru belum dapat disinkronkan. Periksa koneksi lalu coba kembali.';

const BACKGROUND_SYNC_COOLDOWN_MS = 30_000;

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());

  const [isInitializing, setIsInitializing] = useState(true);

  const [isRefreshingUser, setIsRefreshingUser] = useState(false);

  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const syncPromiseRef = useRef<Promise<AuthUser | null> | null>(null);

  const syncRequestIdRef = useRef(0);
  const lastBackgroundSyncRef = useRef(0);

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  const invalidatePendingSync = useCallback(() => {
    syncRequestIdRef.current += 1;
    syncPromiseRef.current = null;
    setIsRefreshingUser(false);
  }, []);

  useEffect(() => {
    return subscribeToUnauthorizedSession(() => {
      invalidatePendingSync();
      clearAuthSession();
      setSession(null);
      setLastSyncedAt(null);
      setIsInitializing(false);
      setAuthNotice(SESSION_EXPIRED_MESSAGE);
    });
  }, [invalidatePendingSync]);

  const startUserSync = useCallback((reason: UserSyncReason): Promise<AuthUser | null> => {
    if (syncPromiseRef.current) {
      return syncPromiseRef.current;
    }

    const storedSession = readAuthSession();

    if (!storedSession) {
      setSession(null);

      return Promise.resolve(null);
    }

    const requestId = ++syncRequestIdRef.current;

    const syncPromise = (async () => {
      if (reason !== 'initial') {
        setIsRefreshingUser(true);
      }

      try {
        const user = await authService.getCurrentUser();

        if (requestId !== syncRequestIdRef.current) {
          return null;
        }

        const nextSession: AuthSession = {
          ...storedSession,
          user,
        };

        writeAuthSession(nextSession);
        setSession(nextSession);
        setLastSyncedAt(new Date().toISOString());
        setAuthNotice(null);

        return user;
      } catch (error: unknown) {
        if (requestId !== syncRequestIdRef.current) {
          return null;
        }

        const status = error instanceof ApiError ? error.status : null;

        const accessRejected = status === 401 || status === 403;

        if (accessRejected || reason === 'initial') {
          clearAuthSession();
          setSession(null);
          setLastSyncedAt(null);

          if (status === 403) {
            setAuthNotice(ACCOUNT_ACCESS_REVOKED_MESSAGE);
          } else if (status === 401) {
            setAuthNotice(SESSION_EXPIRED_MESSAGE);
          } else {
            setAuthNotice(SESSION_VERIFICATION_MESSAGE);
          }

          return null;
        }

        setAuthNotice(PERMISSION_SYNC_FAILED_MESSAGE);

        return null;
      } finally {
        if (requestId === syncRequestIdRef.current && reason !== 'initial') {
          setIsRefreshingUser(false);
        }
      }
    })();

    syncPromiseRef.current = syncPromise;

    void syncPromise.finally(() => {
      if (syncPromiseRef.current === syncPromise) {
        syncPromiseRef.current = null;
      }
    });

    return syncPromise;
  }, []);

  useEffect(() => {
    let active = true;

    async function initializeSession() {
      await startUserSync('initial');

      if (active) {
        setIsInitializing(false);
      }
    }

    void initializeSession();

    return () => {
      active = false;
    };
  }, [startUserSync]);

  useEffect(() => {
    function synchronizeAfterFocus() {
      if (!readAuthSession()) {
        return;
      }

      const currentTime = Date.now();

      if (currentTime - lastBackgroundSyncRef.current < BACKGROUND_SYNC_COOLDOWN_MS) {
        return;
      }

      lastBackgroundSyncRef.current = currentTime;

      void startUserSync('background');
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        synchronizeAfterFocus();
      }
    }

    window.addEventListener('focus', synchronizeAfterFocus);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', synchronizeAfterFocus);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startUserSync]);

  const completeLogin = useCallback(
    async (initialSession: AuthSession, expectedRole: AuthRole): Promise<AuthUser> => {
      invalidatePendingSync();
      setAuthNotice(null);

      const requestId = syncRequestIdRef.current;

      writeAuthSession(initialSession);

      try {
        const verifiedUser = await authService.getCurrentUser();

        if (requestId !== syncRequestIdRef.current) {
          throw new ApiError('Sesi login tidak dapat diverifikasi.', 401);
        }

        if (verifiedUser.role !== expectedRole) {
          throw new ApiError('Peran akun tidak sesuai dengan jenis login yang dipilih.', 403);
        }

        const verifiedSession: AuthSession = {
          ...initialSession,
          user: verifiedUser,
        };

        writeAuthSession(verifiedSession);
        setSession(verifiedSession);
        setLastSyncedAt(new Date().toISOString());

        return verifiedUser;
      } catch (error: unknown) {
        if (requestId === syncRequestIdRef.current) {
          clearAuthSession();
          setSession(null);
          setLastSyncedAt(null);
        }

        setAuthNotice(null);

        throw error;
      }
    },
    [invalidatePendingSync],
  );

  const loginAsNurse = useCallback(
    async (payload: NurseLoginPayload): Promise<AuthUser> => {
      const initialSession = await authService.loginNurse(payload);

      return completeLogin(initialSession, 'nurse');
    },
    [completeLogin],
  );

  const loginAsAdmin = useCallback(
    async (payload: AdminLoginPayload): Promise<AuthUser> => {
      const initialSession = await authService.loginAdmin(payload);

      return completeLogin(initialSession, 'admin');
    },
    [completeLogin],
  );

  const refreshUser = useCallback(() => {
    return startUserSync('manual');
  }, [startUserSync]);

  const logout = useCallback(async () => {
    invalidatePendingSync();

    try {
      await authService.logout();
    } catch {
      // Local session must still be removed
      // when the API is unavailable.
    } finally {
      clearAuthSession();
      setSession(null);
      setLastSyncedAt(null);
      setAuthNotice(null);
    }
  }, [invalidatePendingSync]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isInitializing,
      isRefreshingUser,
      authNotice,
      lastSyncedAt,
      loginAsNurse,
      loginAsAdmin,
      refreshUser,
      logout,
      clearAuthNotice,
    }),
    [
      authNotice,
      clearAuthNotice,
      isInitializing,
      isRefreshingUser,
      lastSyncedAt,
      loginAsAdmin,
      loginAsNurse,
      logout,
      refreshUser,
      session,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
