import { createContext } from 'react';

import type {
  AdminLoginPayload,
  AuthSession,
  AuthUser,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

export interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  authNotice: string | null;
  loginAsNurse: (payload: NurseLoginPayload) => Promise<AuthUser>;
  loginAsAdmin: (payload: AdminLoginPayload) => Promise<AuthUser>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
