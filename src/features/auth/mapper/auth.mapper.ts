import { isPermission } from '@/features/auth/constants/permissions';
import type { AuthRole, AuthSession, AuthUser } from '@/features/auth/types/auth.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readRequiredString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid authentication response field: ${key}.`);
  }

  return value;
}

function readNullableString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`Invalid authentication response field: ${key}.`);
  }

  return value;
}

function mapRole(value: unknown): AuthRole {
  if (value === 'nurse' || value === 'admin') {
    return value;
  }

  throw new Error('Invalid authentication role.');
}

function mapPermissions(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error('Invalid authentication permissions.');
  }

  return [...new Set(value.filter(isPermission))];
}

function mapAuthUser(value: unknown): AuthUser {
  if (!isRecord(value)) {
    throw new Error('Invalid authenticated user response.');
  }

  if (typeof value.id !== 'number') {
    throw new Error('Invalid authenticated user ID.');
  }

  return {
    id: value.id,
    name: readRequiredString(value, 'name'),
    nim: readNullableString(value, 'nim'),
    email: readNullableString(value, 'email'),
    role: mapRole(value.role),
    permissions: mapPermissions(value.permissions),
  };
}

export function mapLoginResponse(value: unknown): AuthSession {
  if (!isRecord(value) || !isRecord(value.data)) {
    throw new Error('Invalid login response.');
  }

  const token = readRequiredString(value.data, 'token');
  const tokenType = readRequiredString(value.data, 'token_type');

  if (tokenType !== 'Bearer') {
    throw new Error('Unsupported authentication token type.');
  }

  return {
    accessToken: token,
    tokenType: 'Bearer',
    user: mapAuthUser(value.data.user),
  };
}

export function mapCurrentUserResponse(value: unknown): AuthUser {
  if (!isRecord(value)) {
    throw new Error('Invalid current user response.');
  }

  return mapAuthUser(value.data);
}
