import type { Permission } from '@/features/auth/constants/permissions';

export type Role = 'nurse' | 'admin';

export type AuthRole = Role;

export type AuthErrorReason =
  | 'unauthenticated'
  | 'invalid_api_session'
  | 'session_expired'
  | 'idle_timeout';

export interface AuthUser {
  id: number;
  name: string;
  nim: string | null;
  email: string | null;
  role: Role;
  permissions: Permission[];
}

export interface AuthSession {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  idleTimeoutMinutes: number;
  user: AuthUser;
}

export interface ApiErrorResponse {
  message?: string;
  reason?: AuthErrorReason;
  errors?: Record<string, string[]>;
}

export interface NurseLoginPayload {
  nim: string;
  password: string;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}
