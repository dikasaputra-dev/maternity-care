import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { AuthContext } from '@/features/auth/context/auth-context';
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from '@/features/auth/lib/auth-session';
import { authService } from '@/features/auth/services/auth.service';
import type {
  AdminLoginPayload,
  AuthSession,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());
  const [isInitializing, setIsInitializing] = useState(true);

  const refreshUser = useCallback(async () => {
    const storedSession = readAuthSession();

    if (!storedSession) {
      setSession(null);

      return;
    }

    const user = await authService.getCurrentUser();

    const nextSession: AuthSession = {
      ...storedSession,
      user,
    };

    writeAuthSession(nextSession);
    setSession(nextSession);
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
      } catch {
        clearAuthSession();

        if (isActive) {
          setSession(null);
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

  const loginAsNurse = useCallback(async (payload: NurseLoginPayload) => {
    const nextSession = await authService.loginNurse(payload);

    writeAuthSession(nextSession);
    setSession(nextSession);
  }, []);

  const loginAsAdmin = useCallback(async (payload: AdminLoginPayload) => {
    const nextSession = await authService.loginAdmin(payload);

    writeAuthSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Local session must still be cleared when the server is unavailable.
    } finally {
      clearAuthSession();
      setSession(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isInitializing,
      loginAsNurse,
      loginAsAdmin,
      refreshUser,
      logout,
    }),
    [isInitializing, loginAsAdmin, loginAsNurse, logout, refreshUser, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
