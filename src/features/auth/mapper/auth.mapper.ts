import { ApiError } from '@/api/api-error';
import { isPermission } from '@/features/auth/constants/permissions';
import type { AuthUserDto } from '@/features/auth/types/auth.dto';
import type { AuthSession, AuthUser, Role } from '@/features/auth/types/auth.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRole(value: unknown): value is Role {
  return value === 'nurse' || value === 'admin';
}

function resolveRole(value: Record<string, unknown>, fallbackRole?: Role): Role | null {
  if (isRole(value.role)) {
    return value.role;
  }

  if (Array.isArray(value.roles)) {
    const roleFromRoles = value.roles.find(isRole);

    if (roleFromRoles) {
      return roleFromRoles;
    }
  }

  return fallbackRole ?? null;
}

function parseAuthUserDto(value: unknown, fallbackRole?: Role): AuthUserDto {
  if (!isRecord(value)) {
    throw new ApiError('Format user dari server tidak valid.');
  }

  const resolvedRole = resolveRole(value, fallbackRole);

  if (
    typeof value.id !== 'number' ||
    typeof value.name !== 'string' ||
    !resolvedRole ||
    !Array.isArray(value.permissions)
  ) {
    throw new ApiError('Format user dari server tidak lengkap.');
  }

  return {
    id: value.id,
    name: value.name,
    nim: typeof value.nim === 'string' ? value.nim : null,
    email: typeof value.email === 'string' ? value.email : null,
    role: resolvedRole,
    roles: Array.isArray(value.roles)
      ? value.roles.filter((role): role is string => typeof role === 'string')
      : [resolvedRole],
    permissions: value.permissions.filter(
      (permission): permission is string => typeof permission === 'string',
    ),
  };
}

function mapAuthUserDto(dto: AuthUserDto): AuthUser {
  return {
    id: dto.id,
    name: dto.name,
    nim: dto.nim,
    email: dto.email,
    role: dto.role ?? 'nurse',
    permissions: dto.permissions.filter(isPermission),
  };
}

function readTokenType(value: unknown): 'Bearer' {
  if (value !== 'Bearer') {
    throw new ApiError('Tipe token login dari server tidak valid.');
  }

  return 'Bearer';
}

function readExpiresAt(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError('Waktu kedaluwarsa token dari server tidak valid.');
  }

  return value;
}

function readIdleTimeoutMinutes(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new ApiError('Idle timeout dari server tidak valid.');
  }

  return value;
}

export function mapLoginResponse(response: unknown, expectedRole: Role): AuthSession {
  if (!isRecord(response) || !isRecord(response.data)) {
    throw new ApiError('Format response login tidak valid.');
  }

  const data = response.data;

  if (typeof data.token !== 'string') {
    throw new ApiError('Token login dari server tidak valid.');
  }

  const user = mapAuthUserDto(parseAuthUserDto(data.user, expectedRole));

  if (user.role !== expectedRole) {
    throw new ApiError('Role user tidak sesuai dengan endpoint login.');
  }

  return {
    accessToken: data.token,
    tokenType: readTokenType(data.token_type),
    expiresAt: readExpiresAt(data.expires_at),
    idleTimeoutMinutes: readIdleTimeoutMinutes(data.idle_timeout_minutes),
    user,
  };
}

export function mapMeResponse(response: unknown): AuthUser {
  if (!isRecord(response) || !isRecord(response.data)) {
    throw new ApiError('Format response /me tidak valid.');
  }

  return mapAuthUserDto(parseAuthUserDto(response.data));
}

export function mapMessageResponse(response: unknown) {
  if (!isRecord(response)) {
    return 'Berhasil.';
  }

  return typeof response.message === 'string' ? response.message : 'Berhasil.';
}
