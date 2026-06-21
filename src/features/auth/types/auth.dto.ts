import type { ApiSuccessResponse } from '@/api/api.types';

export interface AuthUserDto {
  id: number;
  name: string;
  nim: string | null;
  email: string | null;
  role: string;
  permissions: string[];
}

export type LoginResponseDto = ApiSuccessResponse<{
  token: string;
  token_type: string;
  user: AuthUserDto;
}>;

export type CurrentUserResponseDto = ApiSuccessResponse<AuthUserDto>;
