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
} from '@/features/auth/types/auth.types';

async function loginAndSyncUser(
  loginResponse: unknown,
  expectedRole: 'nurse' | 'admin',
): Promise<AuthSession> {
  const loginSession = mapLoginResponse(loginResponse, expectedRole);

  const syncedUser = mapMeResponse(await getMe(loginSession.accessToken));

  return {
    ...loginSession,
    user: syncedUser,
  };
}

export async function loginNurse(payload: NurseLoginPayload): Promise<AuthSession> {
  return loginAndSyncUser(await postNurseLogin(payload), 'nurse');
}

export async function loginAdmin(payload: AdminLoginPayload): Promise<AuthSession> {
  return loginAndSyncUser(await postAdminLogin(payload), 'admin');
}

export async function getAuthenticatedUser(): Promise<AuthUser> {
  return mapMeResponse(await getMe());
}

export async function logout(): Promise<string> {
  return mapMessageResponse(await postLogout());
}

export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  return mapMessageResponse(await patchChangePassword(payload));
}
