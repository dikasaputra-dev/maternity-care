import { apiAuthService } from '@/features/auth/services/api-auth.service';
import { mockAuthService } from '@/features/auth/services/mock-auth.service';
import type {
  AdminLoginPayload,
  AuthSession,
  AuthUser,
  ChangePasswordPayload,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

export interface AuthService {
  loginNurse: (payload: NurseLoginPayload) => Promise<AuthSession>;
  loginAdmin: (payload: AdminLoginPayload) => Promise<AuthSession>;
  getCurrentUser: () => Promise<AuthUser>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export type AuthMode = 'mock' | 'api';

export const authMode: AuthMode = import.meta.env.VITE_AUTH_MODE === 'api' ? 'api' : 'mock';

export const authService: AuthService = authMode === 'api' ? apiAuthService : mockAuthService;
