import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

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
  AuthSession,
  AuthUser,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

const SESSION_EXPIRED_MESSAGE = 'Sesi Anda telah berakhir. Silakan masuk kembali.';

const SESSION_VERIFICATION_MESSAGE = 'Sesi tidak dapat diverifikasi. Silakan masuk kembali.';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());

  const [isInitializing, setIsInitializing] = useState(true);

  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  useEffect(() => {
    return subscribeToUnauthorizedSession(() => {
      clearAuthSession();
      setSession(null);
      setIsInitializing(false);
      setAuthNotice(SESSION_EXPIRED_MESSAGE);
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const storedSession = readAuthSession();

    if (!storedSession) {
      setSession(null);

      return;
    }

    try {
      const user = await authService.getCurrentUser();

      const nextSession: AuthSession = {
        ...storedSession,
        user,
      };

      writeAuthSession(nextSession);
      setSession(nextSession);
    } catch (error: unknown) {
      clearAuthSession();
      setSession(null);

      if (!(error instanceof ApiError && error.status === 401)) {
        setAuthNotice(SESSION_VERIFICATION_MESSAGE);
      }

      throw error;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function initializeSession() {
      const storedSession = readAuthSession();

      if (!storedSession) {
        if (isActive) {
          setSession(null);
          setIsInitializing(false);
        }

        return;
      }

      try {
        const user = await authService.getCurrentUser();

        if (!isActive) {
          return;
        }

        const nextSession: AuthSession = {
          ...storedSession,
          user,
        };

        writeAuthSession(nextSession);
        setSession(nextSession);
      } catch (error: unknown) {
        clearAuthSession();

        if (!isActive) {
          return;
        }

        setSession(null);

        if (!(error instanceof ApiError && error.status === 401)) {
          setAuthNotice(SESSION_VERIFICATION_MESSAGE);
        }
      } finally {
        if (isActive) {
          setIsInitializing(false);
        }
      }
    }

    void initializeSession();

    return () => {
      isActive = false;
    };
  }, []);

  const loginAsNurse = useCallback(async (payload: NurseLoginPayload): Promise<AuthUser> => {
    setAuthNotice(null);

    const nextSession = await authService.loginNurse(payload);

    writeAuthSession(nextSession);
    setSession(nextSession);

    return nextSession.user;
  }, []);

  const loginAsAdmin = useCallback(async (payload: AdminLoginPayload): Promise<AuthUser> => {
    setAuthNotice(null);

    const nextSession = await authService.loginAdmin(payload);

    writeAuthSession(nextSession);
    setSession(nextSession);

    return nextSession.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Local session must still be removed
      // when the API cannot be reached.
    } finally {
      clearAuthSession();
      setSession(null);
      setAuthNotice(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isInitializing,
      authNotice,
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
      loginAsAdmin,
      loginAsNurse,
      logout,
      refreshUser,
      session,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
