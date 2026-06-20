import { MOCK_ADMIN_USER, MOCK_NURSE_USER } from '@/features/auth/mocks/auth-users.mock';
import type {
  AdminLoginPayload,
  LoginResponse,
  NurseLoginPayload,
} from '@/features/auth/types/auth.types';

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

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export async function loginNurse(payload: NurseLoginPayload): Promise<LoginResponse> {
  await wait(400);

  const normalizedNim = normalizeNim(payload.nim);

  if (normalizedNim !== MOCK_NURSE_NIM || payload.password !== MOCK_PASSWORD) {
    throw new AuthenticationError('NIM atau password tidak valid.');
  }

  return {
    message: 'Login successful.',
    data: {
      token: 'mock-nurse-bearer-token',
      token_type: 'Bearer',
      user: MOCK_NURSE_USER,
    },
  };
}

export async function loginAdmin(payload: AdminLoginPayload): Promise<LoginResponse> {
  await wait(400);

  const normalizedEmail = normalizeEmail(payload.email);

  if (normalizedEmail !== MOCK_ADMIN_EMAIL || payload.password !== MOCK_PASSWORD) {
    throw new AuthenticationError('Email atau password tidak valid.');
  }

  return {
    message: 'Login successful.',
    data: {
      token: 'mock-admin-bearer-token',
      token_type: 'Bearer',
      user: MOCK_ADMIN_USER,
    },
  };
}
