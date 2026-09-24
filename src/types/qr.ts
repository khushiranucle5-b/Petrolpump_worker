/**
 * QR Validation and Security Types
 */
import { CustomerProfile } from './customer';

export type QRErrorCode = 
  | 'QR_EXPIRED' 
  | 'QR_ALREADY_USED' 
  | 'QR_INVALID' 
  | 'CUSTOMER_NOT_FOUND' 
  | 'CUSTOMER_BLOCKED'
  | 'UNAUTHORIZED_WORKER' 
  | 'NETWORK_ERROR' 
  | 'SERVER_ERROR';

export interface QRValidateRequest {
  qrToken: string;
  workerId: string;
  petrolPumpId: string;
  scannedAt: string; // ISO timestamp
}

export interface QRValidateResponse {
  success: boolean;
  valid: boolean;
  qrSessionId: string; // Ephemeral session token for the redemption
  customer: CustomerProfile;
  expiresAt: string; // ISO timestamp for the session
  discountPercentage: number;
}

export interface QRErrorDetails {
  code: QRErrorCode;
  message: string;
  title: string;
  canRetry: boolean;
}
