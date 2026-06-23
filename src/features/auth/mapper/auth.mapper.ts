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

function parseAuthUserDto(value: unknown): AuthUserDto {
  if (!isRecord(value)) {
    throw new ApiError('Format user dari server tidak valid.');
  }

  if (
    typeof value.id !== 'number' ||
    typeof value.name !== 'string' ||
    !isRole(value.role) ||
    !Array.isArray(value.permissions)
  ) {
    throw new ApiError('Format user dari server tidak lengkap.');
  }

  return {
    id: value.id,
    name: value.name,
    nim: typeof value.nim === 'string' ? value.nim : null,
    email: typeof value.email === 'string' ? value.email : null,
    role: value.role,
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
    role: dto.role,
    permissions: dto.permissions.filter(isPermission),
  };
}

export function mapLoginResponse(response: unknown, expectedRole: Role): AuthSession {
  if (!isRecord(response) || !isRecord(response.data)) {
    throw new ApiError('Format response login tidak valid.');
  }

  const data = response.data;

  if (typeof data.token !== 'string' || typeof data.token_type !== 'string') {
    throw new ApiError('Token login dari server tidak valid.');
  }

  const user = mapAuthUserDto(parseAuthUserDto(data.user));

  if (user.role !== expectedRole) {
    throw new ApiError('Role user tidak sesuai dengan endpoint login.');
  }

  return {
    accessToken: data.token,
    tokenType: data.token_type,
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
