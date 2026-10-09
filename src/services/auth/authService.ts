/**
 * Authentication and Worker Profile Service
 * Communicates directly with backend authentication and profile APIs.
 */
import { apiClient } from '../api/apiClient';
import { TokenStorage } from './tokenStorage';
import {
  LoginCredentials,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  AuthResponse,
  WorkerUser,
} from '../../types/auth';

export const authService = {
  // 1. Request OTP
  requestOtp: async (mobile: string) => {
    const response = await apiClient.post<{ message: string; mockOtpForTesting?: string; otp?: string }>(
      '/auth/request-otp',
      { mobile },
      { requiresAuth: false }
    );
    if (!response.success) {
      throw new Error(response.error?.message || response.message || 'Network error.');
    }
    return response;
  },

  // 2. Verify OTP
  verifyOtp: async (mobile: string, otp: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', { mobile, otp }, { requiresAuth: false });
    if (!response.success) {
      throw new Error(response.error?.message || response.message || 'Network error.');
    }
    return response;
  }
};

export class AuthService {
  /**
   * Request OTP via API
   */
  static async requestOtp(mobile: string): Promise<{ message: string; mockOtpForTesting?: string }> {
    const response = await authService.requestOtp(mobile);
    return response.data || { message: response.message || 'OTP sent successfully', mockOtpForTesting: (response as any).otp };
  }

  /**
   * Worker Login (OTP / Password) via API
   */
  static async login(credentials: LoginCredentials): Promise<{ user: WorkerUser; token: string }> {
    const data = await authService.verifyOtp(credentials.identifier, credentials.otp || credentials.password);

    if (data.success && data.data) {
      const { user, token } = data.data;
      await TokenStorage.setToken(token);
      await TokenStorage.setUser(user);
      return { user, token };
    }

    throw new Error(data.message || 'Invalid login credentials. Please try again.');
  }

  /**
   * Worker Registration via API
   */
  static async register(payload: RegisterPayload): Promise<{ user: WorkerUser; token: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload, { requiresAuth: false });

    if (response.success && response.data) {
      const { user, token } = response.data;
      await TokenStorage.setToken(token);
      await TokenStorage.setUser(user);
      return { user, token };
    }

    throw new Error(response.message || 'Registration failed. Please try again.');
  }

  /**
   * Request Password Reset OTP via API
   */
  static async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', payload, { requiresAuth: false });

    if (response.success) {
      return { message: response.message || 'Reset instructions have been sent to your registered contact.' };
    }

    throw new Error(response.message || 'Unable to process password reset request.');
  }

  /**
   * Reset Password with OTP via API
   */
  static async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', payload, { requiresAuth: false });

    if (response.success) {
      return { message: response.message || 'Password has been reset successfully.' };
    }

    throw new Error(response.message || 'Failed to reset password.');
  }

  /**
   * Get Current Worker Profile via API
   */
  static async getProfile(): Promise<WorkerUser> {
    const response = await apiClient.get<WorkerUser>(`/profile?t=${Date.now()}`);

    if (response.success && response.data) {
      await TokenStorage.setUser(response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch worker profile.');
  }

  /**
   * Update Profile Details via API
   */
  static async updateProfile(payload: UpdateProfilePayload): Promise<WorkerUser> {
    const response = await apiClient.put<WorkerUser>('/profile', payload);

    if (response.success && response.data) {
      await TokenStorage.setUser(response.data);
      return response.data;
    }

    throw new Error(response.message || 'Failed to update profile.');
  }

  /**
   * Change Password via API
   */
  static async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.put('/password', payload);

    if (response.success) {
      return { message: response.message || 'Password updated successfully.' };
    }

    throw new Error(response.message || 'Failed to change password.');
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignore network errors during logout
    } finally {
      await TokenStorage.clearSession();
    }
  }
}
