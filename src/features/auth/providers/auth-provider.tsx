import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from '@/features/auth/lib/auth-session';
import { loginAdmin, loginNurse } from '@/features/auth/services/mock-auth.service';
import { AuthContext } from '@/features/auth/context/auth-context';
import type {
  AdminLoginPayload,
  AuthSession,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());

  const loginAsNurse = useCallback(async (payload: NurseLoginPayload) => {
    const response = await loginNurse(payload);

    writeAuthSession(response.data);
    setSession(response.data);
  }, []);

  const loginAsAdmin = useCallback(async (payload: AdminLoginPayload) => {
    const response = await loginAdmin(payload);

    writeAuthSession(response.data);
    setSession(response.data);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      loginAsNurse,
      loginAsAdmin,
      logout,
    }),
    [loginAsAdmin, loginAsNurse, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
