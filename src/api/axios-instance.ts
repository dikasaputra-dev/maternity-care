import axios from 'axios';

import { toApiError, type ApiError } from '@/api/api-error';
import { emitUnauthorized } from '@/features/auth/lib/auth-events';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredTokenType,
} from '@/features/auth/lib/auth-session';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL belum dikonfigurasi.');
}

const DEFAULT_SESSION_ENDED_MESSAGE = 'Sesi Anda telah berakhir. Silakan login kembali.';

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

function getUnauthorizedMessage(apiError: ApiError) {
  if (apiError.message && apiError.message !== 'Terjadi kesalahan dari server.') {
    return apiError.message;
  }

  if (apiError.reason === 'idle_timeout') {
    return 'Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.';
  }

  if (apiError.reason === 'unauthenticated') {
    return 'Sesi Anda telah berakhir atau akun telah login di perangkat/browser lain. Silakan login kembali.';
  }

  if (apiError.reason === 'invalid_api_session') {
    return 'Sesi API tidak valid. Silakan login kembali.';
  }

  if (apiError.reason === 'session_expired') {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }

  return DEFAULT_SESSION_ENDED_MESSAGE;
}

axiosInstance.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  const tokenType = getStoredTokenType();

  if (token) {
    config.headers.Authorization = `${tokenType} ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const hadAccessToken = Boolean(getStoredAccessToken());
    const apiError = toApiError(error);

    if (apiError.status === 401 && hadAccessToken) {
      const message = getUnauthorizedMessage(apiError);

      clearAuthSession();

      emitUnauthorized({
        message,
        reason: apiError.reason,
      });
    }

    throw apiError;
  },
);
