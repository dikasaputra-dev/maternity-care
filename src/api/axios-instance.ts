import axios from 'axios';

import { toApiError } from '@/api/api-error';
import { emitUnauthorized } from '@/features/auth/lib/auth-events';
import { clearAuthSession, getStoredAccessToken } from '@/features/auth/lib/auth-session';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL belum dikonfigurasi.');
}

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);

    if (apiError.status === 401 && getStoredAccessToken()) {
      clearAuthSession();
      emitUnauthorized();
    }

    throw apiError;
  },
);
