import { axiosInstance } from '@/api/axios-instance';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth-endpoints';
import type {
  AdminLoginRequestDto,
  ChangePasswordRequestDto,
  NurseLoginRequestDto,
} from '@/features/auth/types/auth.dto';

export async function postNurseLogin(payload: NurseLoginRequestDto): Promise<unknown> {
  const response = await axiosInstance.post<unknown>(AUTH_ENDPOINTS.LOGIN_NURSE, {
    nim: payload.nim.trim(),
    password: payload.password,
  });

  return response.data;
}

export async function postAdminLogin(payload: AdminLoginRequestDto): Promise<unknown> {
  const response = await axiosInstance.post<unknown>(AUTH_ENDPOINTS.LOGIN_ADMIN, {
    email: payload.email.trim(),
    password: payload.password,
  });

  return response.data;
}

export async function getMe(accessToken?: string): Promise<unknown> {
  const response = await axiosInstance.get<unknown>(AUTH_ENDPOINTS.ME, {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });

  return response.data;
}

export async function postLogout(): Promise<unknown> {
  const response = await axiosInstance.post<unknown>(AUTH_ENDPOINTS.LOGOUT);

  return response.data;
}

export async function patchChangePassword(payload: ChangePasswordRequestDto): Promise<unknown> {
  const response = await axiosInstance.patch<unknown>(AUTH_ENDPOINTS.CHANGE_PASSWORD, payload);

  return response.data;
}
