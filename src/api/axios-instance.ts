import axios from 'axios';

import { emitUnauthorizedSession } from '@/features/auth/lib/auth-events';
import { readAuthSession } from '@/features/auth/lib/auth-session';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL.trim() || 'http://localhost:8000/api';

function normalizeRejectedError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Terjadi kesalahan HTTP yang tidak diketahui.', {
    cause: error,
  });
}

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const session = readAuthSession();

  if (session) {
    config.headers.set('Authorization', `${session.tokenType} ${session.accessToken}`);
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const hasStoredSession = readAuthSession() !== null;

    if (axios.isAxiosError(error) && error.response?.status === 401 && hasStoredSession) {
      emitUnauthorizedSession();
    }

    throw normalizeRejectedError(error);
  },
);
