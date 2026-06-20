import axios from 'axios';

import { readAuthSession } from '@/features/auth/lib/auth-session';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL.trim() || 'http://localhost:8000/api';

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
