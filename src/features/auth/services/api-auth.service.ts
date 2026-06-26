import {
  getMe,
  patchChangePassword,
  postAdminLogin,
  postLogout,
  postNurseLogin,
} from '@/features/auth/api/auth.api';
import {
  mapLoginResponse,
  mapMeResponse,
  mapMessageResponse,
} from '@/features/auth/mapper/auth.mapper';
import type {
  AdminLoginPayload,
  AuthSession,
  AuthUser,
  ChangePasswordPayload,
  NurseLoginPayload,
  Role,
} from '@/features/auth/types/auth.types';

export async function loginNurse(payload: NurseLoginPayload): Promise<AuthSession> {
  return mapLoginResponse(await postNurseLogin(payload), 'nurse');
}

export async function loginAdmin(payload: AdminLoginPayload): Promise<AuthSession> {
  return mapLoginResponse(await postAdminLogin(payload), 'admin');
}

export async function getAuthenticatedUser(fallbackRole?: Role): Promise<AuthUser> {
  return mapMeResponse(await getMe(), fallbackRole);
}

export async function logout(): Promise<string> {
  return mapMessageResponse(await postLogout());
}

export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  return mapMessageResponse(await patchChangePassword(payload));
}
