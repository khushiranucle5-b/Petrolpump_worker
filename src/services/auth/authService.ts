/**
 * Authentication and Worker Profile Service
 */
import { apiClient } from '../api/apiClient';
import { CONFIG } from '../../constants/config';
import { TokenStorage } from './tokenStorage';
import { INITIAL_MOCK_WORKER } from '../api/mockData';
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AuthService {
  private static mockWorkerDatabase: WorkerUser = { ...INITIAL_MOCK_WORKER };

  /**
   * Worker Login
   * Accepts Email or Mobile + Password
   */
  static async login(credentials: LoginCredentials): Promise<{ user: WorkerUser; token: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials, { requiresAuth: false });

    if (response.success && response.data) {
      const { user, token } = response.data;
      await TokenStorage.setToken(token);
      await TokenStorage.setUser(user);
      return { user, token };
    }

    // Isolated Mock Fallback when backend is not ready
    if (CONFIG.USE_MOCK_FALLBACK) {
      await sleep(CONFIG.MOCK_DELAY_MS);
      
      const cleanIdent = credentials.identifier.trim().toLowerCase();
      
      // Test password check (default: accept password123 or any >=6 chars)
      if (credentials.password.length < 6) {
        throw new Error('Invalid password length. Must be at least 6 characters.');
      }

      // If credentials indicate pending approval worker for testing
      if (cleanIdent.includes('pending')) {
        const pendingUser: WorkerUser = {
          ...this.mockWorkerDatabase,
          id: 'w-pending-99',
          workerId: 'EMP-PENDING-01',
          fullName: 'Aakash Verma',
          email: 'aakash.pending@petrolpump.com',
          mobileNumber: '9900112233',
          accountStatus: 'pending_approval',
        };
        const token = 'mock_jwt_token_pending_' + Date.now();
        await TokenStorage.setToken(token);
        await TokenStorage.setUser(pendingUser);
        return { user: pendingUser, token };
      }

      const activeUser: WorkerUser = { ...this.mockWorkerDatabase };
      const token = 'mock_jwt_token_' + Date.now();
      await TokenStorage.setToken(token);
      await TokenStorage.setUser(activeUser);
      return { user: activeUser, token };
    }

    throw new Error(response.message || 'Invalid login credentials. Please try again.');
  }

  /**
   * Worker Registration
   */
  static async register(payload: RegisterPayload): Promise<{ user: WorkerUser; token: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload, { requiresAuth: false });

    if (response.success && response.data) {
      const { user, token } = response.data;
      await TokenStorage.setToken(token);
      await TokenStorage.setUser(user);
      return { user, token };
    }

    // Isolated Mock Fallback
    if (CONFIG.USE_MOCK_FALLBACK) {
      await sleep(CONFIG.MOCK_DELAY_MS);

      const newUser: WorkerUser = {
        id: 'w-' + Math.floor(1000 + Math.random() * 9000),
        workerId: payload.workerId.toUpperCase(),
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        mobileNumber: payload.mobileNumber.trim(),
        petrolPumpId: payload.petrolPumpId,
        petrolPumpName: payload.petrolPumpName,
        branchName: payload.branchName,
        role: 'Worker',
        joiningDate: new Date().toISOString(),
        accountStatus: 'pending_approval', // New registrations require admin approval
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockWorkerDatabase = { ...newUser };
      const token = 'mock_reg_token_' + Date.now();
      await TokenStorage.setToken(token);
      await TokenStorage.setUser(newUser);

      return { user: newUser, token };
    }

    throw new Error(response.message || 'Registration failed. Please try again.');
  }

  /**
   * Request Password Reset OTP
   */
  static async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', payload, { requiresAuth: false });

    if (response.success) {
      return { message: response.message || 'Reset instructions have been sent to your registered contact.' };
    }

    if (CONFIG.USE_MOCK_FALLBACK) {
      await sleep(CONFIG.MOCK_DELAY_MS);
      return { message: 'Reset code (OTP: 123456) sent to ' + payload.identifier };
    }

    throw new Error(response.message || 'Unable to process password reset request.');
  }

  /**
   * Reset Password with OTP
   */
  static async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', payload, { requiresAuth: false });

    if (response.success) {
      return { message: response.message || 'Password has been reset successfully.' };
    }

    if (CONFIG.USE_MOCK_FALLBACK) {
      await sleep(CONFIG.MOCK_DELAY_MS);
      if (payload.otp !== '123456' && payload.otp.length !== 6) {
        throw new Error('Invalid or expired OTP code. Use 123456 for demo.');
      }
      return { message: 'Your password has been changed successfully. You can now login.' };
    }

    throw new Error(response.message || 'Failed to reset password.');
  }

  /**
   * Get Current Worker Profile
   */
  static async getProfile(): Promise<WorkerUser> {
    const response = await apiClient.get<WorkerUser>('/worker/profile');

    if (response.success && response.data) {
      await TokenStorage.setUser(response.data);
      return response.data;
    }

    if (CONFIG.USE_MOCK_FALLBACK) {
      await sleep(300);
      const user = await TokenStorage.getUser();
      return user || this.mockWorkerDatabase;
    }

    throw new Error(response.message || 'Failed to fetch worker profile.');
  }

  /**
   * Update Profile Details (Allowed fields only: Name, Mobile, Email, Photo)
   */
  static async updateProfile(payload: UpdateProfilePayload): Promise<WorkerUser> {
    const response = await apiClient.put<WorkerUser>('/worker/profile', payload);

    if (response.success && response.data) {
      await TokenStorage.setUser(response.data);
      return response.data;
    }

    if (CONFIG.USE_MOCK_FALLBACK) {
      await sleep(CONFIG.MOCK_DELAY_MS);
      const currentUser = (await TokenStorage.getUser()) || this.mockWorkerDatabase;
      const updatedUser: WorkerUser = {
        ...currentUser,
        fullName: payload.fullName !== undefined ? payload.fullName.trim() : currentUser.fullName,
        mobileNumber: payload.mobileNumber !== undefined ? payload.mobileNumber.trim() : currentUser.mobileNumber,
        email: payload.email !== undefined ? payload.email.trim() : currentUser.email,
        profilePhotoUrl: payload.profilePhotoUrl !== undefined ? payload.profilePhotoUrl : currentUser.profilePhotoUrl,
        updatedAt: new Date().toISOString(),
      };

      this.mockWorkerDatabase = { ...updatedUser };
      await TokenStorage.setUser(updatedUser);
      return updatedUser;
    }

    throw new Error(response.message || 'Failed to update profile.');
  }

  /**
   * Change Password
   */
  static async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const response = await apiClient.put('/worker/password', payload);

    if (response.success) {
      return { message: response.message || 'Password updated successfully.' };
    }

    if (CONFIG.USE_MOCK_FALLBACK) {
      await sleep(CONFIG.MOCK_DELAY_MS);
      if (!payload.currentPassword) {
        throw new Error('Current password is required');
      }
      if (payload.newPassword !== payload.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      return { message: 'Password changed successfully!' };
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
