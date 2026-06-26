import { createContext } from 'react';

import type {
  AdminLoginPayload,
  AuthSession,
  AuthUser,
  ChangePasswordPayload,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

export interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  isLoggingOut: boolean;
  isRefreshingUser: boolean;
  lastSyncedAt: string | null;
  authNotice: string | null;

  loginNurse: (payload: NurseLoginPayload) => Promise<AuthUser>;
  loginAdmin: (payload: AdminLoginPayload) => Promise<AuthUser>;

  loginAsNurse: (payload: NurseLoginPayload) => Promise<AuthUser>;
  loginAsAdmin: (payload: AdminLoginPayload) => Promise<AuthUser>;

  logout: () => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<string>;
  refreshUser: () => Promise<AuthUser | null>;
  clearAuthNotice: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
