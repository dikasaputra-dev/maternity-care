import { ApiError } from '@/api/api-error';
import { MOCK_ADMIN_USER, MOCK_NURSE_USER } from '@/features/auth/mocks/auth-users.mock';
import { readAuthSession } from '@/features/auth/lib/auth-session';
import type { AuthService } from '@/features/auth/services/auth.service';

const MOCK_PASSWORD = 'password';
const MOCK_NURSE_NIM = '251FK05002';
const MOCK_ADMIN_EMAIL = 'admin@example.com';

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function normalizeNim(nim: string) {
  return nim.trim().toUpperCase();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const mockAuthService: AuthService = {
  async loginNurse(payload) {
    await wait(400);

    const normalizedNim = normalizeNim(payload.nim);

    if (normalizedNim !== MOCK_NURSE_NIM || payload.password !== MOCK_PASSWORD) {
      throw new ApiError('Kredensial tidak valid.', 422);
    }

    return {
      accessToken: 'mock-nurse-bearer-token',
      tokenType: 'Bearer',
      user: MOCK_NURSE_USER,
    };
  },

  async loginAdmin(payload) {
    await wait(400);

    const normalizedEmail = normalizeEmail(payload.email);

    if (normalizedEmail !== MOCK_ADMIN_EMAIL || payload.password !== MOCK_PASSWORD) {
      throw new ApiError('Kredensial tidak valid.', 422);
    }

    return {
      accessToken: 'mock-admin-bearer-token',
      tokenType: 'Bearer',
      user: MOCK_ADMIN_USER,
    };
  },

  async getCurrentUser() {
    await wait(200);

    const session = readAuthSession();

    if (!session) {
      throw new ApiError('Unauthenticated.', 401);
    }

    return session.user;
  },

  async logout() {
    await wait(150);
  },
};
