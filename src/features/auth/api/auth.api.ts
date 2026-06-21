import { axiosInstance } from '@/api/axios-instance';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth-endpoints';
import type {
  AdminLoginPayload,
  ChangePasswordPayload,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

export async function postNurseLogin(payload: NurseLoginPayload): Promise<unknown> {
  const response = await axiosInstance.post<unknown>(AUTH_ENDPOINTS.LOGIN_NURSE, payload);

  return response.data;
}

export async function postAdminLogin(payload: AdminLoginPayload): Promise<unknown> {
  const response = await axiosInstance.post<unknown>(AUTH_ENDPOINTS.LOGIN_ADMIN, payload);

  return response.data;
}

export async function postLogout(): Promise<void> {
  await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
}

export async function getCurrentUser(): Promise<unknown> {
  const response = await axiosInstance.get<unknown>(AUTH_ENDPOINTS.CURRENT_USER);

  return response.data;
}

export async function patchChangePassword(payload: ChangePasswordPayload): Promise<void> {
  await axiosInstance.patch(AUTH_ENDPOINTS.CHANGE_PASSWORD, payload);
}
