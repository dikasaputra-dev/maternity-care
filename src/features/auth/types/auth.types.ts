import type { Permission } from '@/features/auth/constants/permissions';

export type AuthRole = 'nurse' | 'admin';

export interface AuthUser {
  id: number;
  name: string;
  nim: string | null;
  email: string | null;
  role: AuthRole;
  permissions: Permission[];
}

export interface AuthSession {
  accessToken: string;
  tokenType: 'Bearer';
  user: AuthUser;
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
