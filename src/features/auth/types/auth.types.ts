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
  token: string;
  token_type: 'Bearer';
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

export interface LoginResponse {
  message: string;
  data: AuthSession;
}
