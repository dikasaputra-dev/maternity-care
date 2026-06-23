import type { Permission } from '@/features/auth/constants/permissions';

export type Role = 'nurse' | 'admin';

export type AuthRole = Role;

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
  tokenType: string;
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
