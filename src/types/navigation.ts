/**
 * Navigation Parameter Lists
 */
import { CustomerProfile } from './customer';
import { Transaction } from './transaction';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: { prefillIdentifier?: string } | undefined;
  ResetPassword: { identifier: string };
  PendingApproval: { workerName?: string; workerId?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  ScannerTab: undefined;
  HistoryTab: undefined;
};

export type RootStackParamList = {
  // Auth
  Auth: undefined;
  PendingApproval: { workerName?: string; workerId?: string };
  
  // Main
  MainTabs: undefined;
  
  // Scanner & Redemption Flow
  QRScanner: undefined;
  CustomerDetails: {
    customer: CustomerProfile;
    qrSessionId: string;
    discountPercentage: number;
  };
  FuelAmount: {
    customer: CustomerProfile;
    qrSessionId: string;
    discountPercentage: number;
  };
  RedemptionConfirmation: {
    customer: CustomerProfile;
    qrSessionId: string;
    discountPercentage: number;
    fuelAmount: number;
    discountAmount: number;
    finalAmount: number;
  };
  RedemptionSuccess: {
    transaction: Transaction;
  };

  // Transaction History Flow
  TransactionDetails: {
    transaction: Transaction;
  };

  // Profile Flow
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};
