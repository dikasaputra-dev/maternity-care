import { ALL_PERMISSIONS, NURSE_PERMISSIONS } from '@/features/auth/constants/permissions';
import type { AuthUser } from '@/features/auth/types/auth.types';

export const MOCK_NURSE_USER: AuthUser = {
  id: 1,
  name: 'Rina Nuraini',
  nim: '251FK05002',
  email: 'rina.nuraini@example.com',
  role: 'nurse',
  permissions: [...NURSE_PERMISSIONS],
};

export const MOCK_ADMIN_USER: AuthUser = {
  id: 2,
  name: 'Admin MaternityCare',
  nim: null,
  email: 'admin@example.com',
  role: 'admin',
  permissions: [...ALL_PERMISSIONS],
};
