import { createContext } from 'react';

import type {
  AdminLoginPayload,
  AuthSession,
  AuthUser,
  ChangePasswordPayload,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

export interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isRefreshingUser: boolean;
  isLoggingOut: boolean;
  authNotice: string | null;
  lastSyncedAt: string | null;
  loginAsNurse: (payload: NurseLoginPayload) => Promise<AuthUser>;
  loginAsAdmin: (payload: AdminLoginPayload) => Promise<AuthUser>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  clearAuthNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
