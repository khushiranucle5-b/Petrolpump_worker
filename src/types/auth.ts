/**
 * Worker Authentication and Profile Types
 */

export type AccountStatus = 'active' | 'pending_approval' | 'suspended' | 'rejected' | 'inactive';

export interface WorkerUser {
  id: string;
  workerId: string; // Employee ID e.g. "EMP-9082"
  fullName: string;
  email: string;
  mobileNumber: string;
  petrolPumpId: string;
  petrolPumpName: string;
  branchName: string;
  role: 'Worker' | 'Senior Attendant' | 'Shift Lead';
  profilePhotoUrl?: string;
  joiningDate: string;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  identifier: string; // Email or mobile
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword?: string;
  workerId: string; // Employee ID
  petrolPumpId: string;
  petrolPumpName: string;
  branchName: string;
}

export interface ForgotPasswordPayload {
  identifier: string; // Email or mobile
}

export interface ResetPasswordPayload {
  identifier: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  mobileNumber?: string;
  email?: string;
  profilePhotoUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: WorkerUser;
  expiresIn?: number;
}
