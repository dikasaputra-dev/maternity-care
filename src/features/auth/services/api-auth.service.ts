import { toApiError } from '@/api/api-error';
import {
  getCurrentUser,
  postAdminLogin,
  postLogout,
  postNurseLogin,
} from '@/features/auth/api/auth.api';
import { mapCurrentUserResponse, mapLoginResponse } from '@/features/auth/mapper/auth.mapper';
import type { AuthService } from '@/features/auth/services/auth.service';

export const apiAuthService: AuthService = {
  async loginNurse(payload) {
    try {
      const response = await postNurseLogin(payload);

      return mapLoginResponse(response);
    } catch (error: unknown) {
      throw toApiError(error);
    }
  },

  async loginAdmin(payload) {
    try {
      const response = await postAdminLogin(payload);

      return mapLoginResponse(response);
    } catch (error: unknown) {
      throw toApiError(error);
    }
  },

  async getCurrentUser() {
    try {
      const response = await getCurrentUser();

      return mapCurrentUserResponse(response);
    } catch (error: unknown) {
      throw toApiError(error);
    }
  },

  async logout() {
    try {
      await postLogout();
    } catch (error: unknown) {
      throw toApiError(error);
    }
  },
};
