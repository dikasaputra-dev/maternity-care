export interface AuthUserDto {
  id: number;
  name: string;
  nim: string | null;
  email: string | null;
  role: string;
  permissions: string[];
}

export interface LoginResponseDto {
  message: string;
  data: {
    token: string;
    token_type: string;
    user: AuthUserDto;
  };
}

export interface CurrentUserResponseDto {
  message: string;
  data: AuthUserDto;
}
