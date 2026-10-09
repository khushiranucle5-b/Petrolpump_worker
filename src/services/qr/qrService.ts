/**
 * QR Code Validation & OTP Verification Service
 * Validates dynamic 60-second rotating customer QR tokens against backend APIs.
 */
import { apiClient } from '../api/apiClient';
import {
  QRValidateRequest,
  QRValidateResponse,
  QRErrorCode,
  QRErrorDetails,
} from '../../types/qr';

export class QRService {
  /**
   * Validate QR token with backend API
   */
  static async validateQRToken(payload: QRValidateRequest): Promise<QRValidateResponse> {
    const rawToken = payload.qrToken.trim();

    console.log('[QR DEBUG] Scanned raw QR Token:', rawToken);

    if (!rawToken) {
      throw this.createQRError('QR_INVALID', 'The scanned QR code is empty or unreadable.');
    }

    // Call backend endpoint
    const response = await apiClient.post<QRValidateResponse>('/qr/scan', {
      qrToken: rawToken,
      workerId: payload.workerId,
      petrolPumpId: payload.petrolPumpId,
      scannedAt: payload.scannedAt || new Date().toISOString(),
    });

    console.log('[QR DEBUG] Backend Response for /qr/scan:', JSON.stringify(response, null, 2));

    if (response.success && response.data) {
      return response.data;
    }

    // Translate backend error
    const errCode = (response.error?.code as QRErrorCode) || 'SERVER_ERROR';
    console.log('[QR DEBUG] Translated Error Code:', errCode);
    throw this.createQRError(errCode, response.message || 'QR Validation failed');
  }

  /**
   * Verify Customer OTP for discount redemption via API
   */
  static async verifyOTP(payload: {
    customerId: string;
    qrSessionId: string;
    otp: string;
  }): Promise<{ success: boolean; message: string }> {
    const trimmedOtp = payload.otp.trim();
    if (!trimmedOtp) {
      throw new Error('Please enter the OTP provided by the customer.');
    }

    const response = await apiClient.post<{ success: boolean; message: string }>('/qr/verify-otp', {
      customerId: payload.customerId,
      qrSessionId: payload.qrSessionId,
      otp: trimmedOtp,
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'OTP verification failed.');
  }

  /**
   * Dummy markTokenUsed helper (kept for interface compatibility)
   */
  static markTokenUsed(_qrSessionId: string) {
    // Handled by backend
  }

  /**
   * Helper to format standardized user-friendly QRError
   */
  public static createQRError(code: QRErrorCode, customMessage?: string): Error & QRErrorDetails {
    let title = 'Scan Error';
    let message = customMessage || 'An error occurred while validating the QR code.';
    let canRetry = true;

    switch (code) {
      case 'QR_EXPIRED':
        title = 'QR Code Expired';
        message = customMessage || 'Customer QR codes rotate every 60 seconds for security. Please ask the customer to generate a fresh QR code.';
        break;
      case 'QR_ALREADY_USED':
        title = 'Already Redeemed';
        message = customMessage || 'This one-time QR token was already redeemed. Ask customer to generate a new QR code.';
        break;
      case 'QR_INVALID':
        title = 'Invalid QR Code';
        message = customMessage || 'The scanned QR code is not a valid PetrolPump customer token.';
        break;
      case 'CUSTOMER_NOT_FOUND':
        title = 'Customer Not Found';
        message = customMessage || 'No active customer or group found matching this QR token.';
        break;
      case 'CUSTOMER_BLOCKED':
        title = 'Account Suspended';
        message = customMessage || 'This customer account is inactive or suspended. Cannot redeem discount.';
        canRetry = false;
        break;
      case 'UNAUTHORIZED_WORKER':
        title = 'Unauthorized';
        message = 'Your worker account is not authorized to redeem transactions at this pump.';
        canRetry = false;
        break;
      case 'NETWORK_ERROR':
        title = 'Connection Problem';
        message = 'Unable to connect to server. Please check internet connection and retry.';
        break;
      case 'SERVER_ERROR':
      default:
        title = ' Error';
        message = customMessage || 'Something went wrong on the server while validating QR.';
        break;
    }

    const err = new Error(message) as Error & QRErrorDetails;
    err.code = code;
    err.title = title;
    err.message = message;
    err.canRetry = canRetry;
    return err;
  }
}
