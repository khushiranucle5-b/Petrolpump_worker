/**
 * Transaction & History Types
 */

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export type HistoryFilterType = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';

export interface Transaction {
  id: string;
  transactionId: string; // e.g. "TXN-8823491"
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerPhotoUrl?: string;
  groupId: string;
  groupName: string;
  groupType: string;
  fuelAmount: number; // e.g. 1000
  discountPercentage: number; // e.g. 10
  discountAmount: number; // e.g. 100
  finalAmount: number; // e.g. 900
  workerId: string;
  workerName: string;
  petrolPumpId: string;
  petrolPumpName: string;
  branchName: string;
  status: TransactionStatus;
  createdAt: string; // ISO string
  notes?: string;
}

export interface RedeemTransactionRequest {
  qrSessionId: string; // Short-lived verified session from backend QR validate
  customerId: string;
  fuelAmount: number;
  workerId: string;
  petrolPumpId: string;
  idempotencyKey: string; // Prevent duplicate submissions
}

export interface RedeemTransactionResponse {
  success: boolean;
  message: string;
  transaction: Transaction;
}

export interface HistoryFilterParams {
  filterType: HistoryFilterType;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface TodayStats {
  transactionCount: number;
  totalFuelAmount: number;
  totalDiscountAmount: number;
  totalFinalAmount: number;
  date: string;
}
