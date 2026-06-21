export const AUTH_ENDPOINTS = {
  LOGIN_NURSE: '/auth/login/nurse',
  LOGIN_ADMIN: '/auth/login/admin',
  LOGOUT: '/auth/logout',
  CURRENT_USER: '/me',
  CHANGE_PASSWORD: '/me/password',
} as const;
