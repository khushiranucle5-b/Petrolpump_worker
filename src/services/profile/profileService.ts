/**
 * Worker Profile Service wrapper
 */
import { AuthService } from '../auth/authService';
import { WorkerUser, UpdateProfilePayload, ChangePasswordPayload } from '../../types/auth';

export class ProfileService {
  static getProfile(): Promise<WorkerUser> {
    return AuthService.getProfile();
  }

  static updateProfile(payload: UpdateProfilePayload): Promise<WorkerUser> {
    return AuthService.updateProfile(payload);
  }

  static changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    return AuthService.changePassword(payload);
  }
}
