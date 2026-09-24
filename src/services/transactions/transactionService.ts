/**
 * Transaction and Redemption Service
 * Final authority on discount calculations, idempotency protection,
 * date-based filtering, and persistent transaction history.
 */
import { apiClient } from '../api/apiClient';
import { CONFIG } from '../../constants/config';
import { INITIAL_TRANSACTIONS, MOCK_CUSTOMERS } from '../api/mockData';
import { QRService } from '../qr/qrService';
import {
  Transaction,
  RedeemTransactionRequest,
  RedeemTransactionResponse,
  HistoryFilterParams,
  TodayStats,
} from '../../types/transaction';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class TransactionService {
  // In-memory persistent list of transactions for mock state
  private static transactions: Transaction[] = [];
  private static transactionsLoaded = false;
  private static processedIdempotencyKeys = new Set<string>();

  private static async initMockStorage() {
    if (this.transactionsLoaded) return;
    try {
      const data = await AsyncStorage.getItem('@MOCK_TRANSACTIONS');
      if (data) {
        this.transactions = JSON.parse(data);
      } else {
        this.transactions = [...INITIAL_TRANSACTIONS];
        await AsyncStorage.setItem('@MOCK_TRANSACTIONS', JSON.stringify(this.transactions));
      }
    } catch (e) {
      console.warn('Failed to init transaction storage', e);
      if (this.transactions.length === 0) {
        this.transactions = [...INITIAL_TRANSACTIONS];
      }
    }
    this.transactionsLoaded = true;
  }

  /**
   * Redeem a fuel transaction
   */
  static async redeem(payload: RedeemTransactionRequest): Promise<Transaction> {
    // Prevent duplicate submission client-side
    if (this.processedIdempotencyKeys.has(payload.idempotencyKey)) {
      throw new Error('This redemption is currently being processed or has already been submitted.');
    }

    const response = await apiClient.post<RedeemTransactionResponse>('/transactions/redeem', payload);

    if (response.success && response.data?.transaction) {
      this.processedIdempotencyKeys.add(payload.idempotencyKey);
      return response.data.transaction;
    }

    // Isolated Mock Fallback
    if (CONFIG.USE_MOCK_FALLBACK) {
      await this.initMockStorage();
      this.processedIdempotencyKeys.add(payload.idempotencyKey);
      await sleep(CONFIG.MOCK_DELAY_MS + 200);

      const customer = MOCK_CUSTOMERS.find(c => c.id === payload.customerId || c.customerId === payload.customerId) || MOCK_CUSTOMERS[0];
      const discountPercentage = customer.group.discountPercentage;
      const fuelAmount = Number(payload.fuelAmount);
      const discountAmount = Number(((fuelAmount * discountPercentage) / 100).toFixed(2));
      const finalAmount = Number((fuelAmount - discountAmount).toFixed(2));

      const newTx: Transaction = {
        id: 'tx-' + Math.floor(100000 + Math.random() * 900000),
        transactionId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        customerId: customer.id,
        customerName: customer.fullName,
        customerMobile: customer.mobileNumber,
        customerPhotoUrl: customer.profilePhotoUrl,
        groupId: customer.group.groupId,
        groupName: customer.group.groupName,
        groupType: customer.group.groupType,
        fuelAmount,
        discountPercentage,
        discountAmount,
        finalAmount,
        workerId: payload.workerId,
        workerName: 'Vikram Singh',
        petrolPumpId: payload.petrolPumpId,
        petrolPumpName: 'Downtown City Station',
        branchName: 'Branch #104 (MG Road)',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        notes: `Standard nozzle delivery - Applied ${discountPercentage}% discount`,
      };

      // Mark the QR session as used
      QRService.markTokenUsed(payload.qrSessionId);

      // Prepend to transaction list
      this.transactions.unshift(newTx);
      
      // Save statically
      await AsyncStorage.setItem('@MOCK_TRANSACTIONS', JSON.stringify(this.transactions));

      return newTx;
    }

    throw new Error(response.message || 'Failed to complete fuel redemption.');
  }

  /**
   * Get transaction history with date filters and search
   */
  static async getTransactions(params: HistoryFilterParams = { filterType: 'TODAY' }): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get<{
      transactions: Transaction[];
      total: number;
      page: number;
      hasMore: boolean;
    }>('/transactions', {
      requiresAuth: true,
    });

    if (response.success && response.data) {
      return response.data;
    }

    // Isolated Mock Filtering & Pagination Fallback
    if (CONFIG.USE_MOCK_FALLBACK) {
      await this.initMockStorage();
      await sleep(CONFIG.MOCK_DELAY_MS - 200);

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
      const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      let filtered = [...this.transactions];

      // Date Filtering
      switch (params.filterType) {
        case 'TODAY':
          filtered = filtered.filter(tx => new Date(tx.createdAt).getTime() >= startOfToday);
          break;
        case 'YESTERDAY':
          filtered = filtered.filter(tx => {
            const txTime = new Date(tx.createdAt).getTime();
            return txTime >= startOfYesterday && txTime < startOfToday;
          });
          break;
        case 'THIS_WEEK':
          filtered = filtered.filter(tx => new Date(tx.createdAt).getTime() >= startOfWeek);
          break;
        case 'THIS_MONTH':
          filtered = filtered.filter(tx => new Date(tx.createdAt).getTime() >= startOfMonth);
          break;
        case 'CUSTOM':
          if (params.startDate) {
            const start = new Date(params.startDate).getTime();
            filtered = filtered.filter(tx => new Date(tx.createdAt).getTime() >= start);
          }
          if (params.endDate) {
            const end = new Date(params.endDate).getTime();
            filtered = filtered.filter(tx => new Date(tx.createdAt).getTime() <= end);
          }
          break;
      }

      // Search query filter (Customer name, ID, Txn ID, Mobile)
      if (params.searchQuery && params.searchQuery.trim()) {
        const q = params.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          tx =>
            tx.customerName.toLowerCase().includes(q) ||
            tx.transactionId.toLowerCase().includes(q) ||
            tx.customerMobile.toLowerCase().includes(q) ||
            tx.groupName.toLowerCase().includes(q)
        );
      }

      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < filtered.length;

      return {
        transactions: paginated,
        total: filtered.length,
        page,
        hasMore,
      };
    }

    throw new Error(response.message || 'Failed to fetch transaction history.');
  }

  /**
   * Get single transaction details
   */
  static async getTransactionDetails(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    if (CONFIG.USE_MOCK_FALLBACK) {
      await this.initMockStorage();
      await sleep(200);
      const tx = this.transactions.find(t => t.id === id || t.transactionId === id);
      if (tx) return tx;
      throw new Error('Transaction record not found.');
    }

    throw new Error(response.message || 'Failed to fetch transaction details.');
  }

  /**
   * Get Today's Summary Metrics for Worker Home Screen
   */
  static async getTodaySummary(): Promise<TodayStats> {
    const response = await apiClient.get<TodayStats>('/transactions/today-summary');

    if (response.success && response.data) {
      return response.data;
    }

    if (CONFIG.USE_MOCK_FALLBACK) {
      await this.initMockStorage();
      await sleep(250);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      const todayTxs = this.transactions.filter(
        tx => new Date(tx.createdAt).getTime() >= startOfToday && tx.status === 'COMPLETED'
      );

      const totalFuelAmount = todayTxs.reduce((sum, tx) => sum + tx.fuelAmount, 0);
      const totalDiscountAmount = todayTxs.reduce((sum, tx) => sum + tx.discountAmount, 0);
      const totalFinalAmount = todayTxs.reduce((sum, tx) => sum + tx.finalAmount, 0);

      return {
        transactionCount: todayTxs.length,
        totalFuelAmount,
        totalDiscountAmount,
        totalFinalAmount,
        date: new Date().toISOString(),
      };
    }

    throw new Error(response.message || 'Failed to fetch today stats.');
  }
}
