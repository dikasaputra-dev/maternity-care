import { axiosInstance } from '@/api/axios-instance';
import type { AdminLoginPayload, NurseLoginPayload } from '@/features/auth/types/auth.types';

export async function postNurseLogin(payload: NurseLoginPayload): Promise<unknown> {
  const response = await axiosInstance.post<unknown>('/auth/login/nurse', payload);

  return response.data;
}

export async function postAdminLogin(payload: AdminLoginPayload): Promise<unknown> {
  const response = await axiosInstance.post<unknown>('/auth/login/admin', payload);

  return response.data;
}

export async function postLogout(): Promise<void> {
  await axiosInstance.post('/auth/logout');
}

export async function getCurrentUser(): Promise<unknown> {
  const response = await axiosInstance.get<unknown>('/me');

  return response.data;
}
