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
  loginAsNurse: (payload: NurseLoginPayload) => Promise<void>;
  loginAsAdmin: (payload: AdminLoginPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
