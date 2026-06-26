export type AuthRoleDto = 'nurse' | 'admin';

export interface AuthUserDto {
  id: number;
  name: string;
  nim: string | null;
  email: string | null;

  /**
   * Backend lama bisa mengirim role.
   * Backend baru bisa mengirim roles.
   * Mapper akan menormalisasi salah satunya menjadi AuthUser.role.
   */
  role?: AuthRoleDto | null;
  roles?: string[];

  permissions: string[];
}

export interface LoginResponseDto {
  message: string;
  data: {
    token: string;
    token_type: 'Bearer';
    expires_at: string;
    idle_timeout_minutes: number;
    user: AuthUserDto;
  };
}

export interface MeResponseDto {
  message: string;
  data: AuthUserDto;
}

export interface MessageResponseDto {
  message: string;
}

export interface NurseLoginRequestDto {
  nim: string;
  password: string;
}

export interface AdminLoginRequestDto {
  email: string;
  password: string;
}

export interface ChangePasswordRequestDto {
  current_password: string;
  password: string;
  password_confirmation: string;
}
