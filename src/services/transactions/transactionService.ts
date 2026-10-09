/**
 * Transaction and Redemption Service
 * Calls live backend API for discount calculations, transaction redemptions,
 * history queries, and metrics summaries.
 */
import { apiClient } from '../api/apiClient';
import {
  Transaction,
  RedeemTransactionRequest,
  RedeemTransactionResponse,
  HistoryFilterParams,
  TodayStats,
} from '../../types/transaction';

export class TransactionService {
  private static processedIdempotencyKeys = new Set<string>();

  /**
   * Helper to dynamically format API transaction fields without hardcoded static data
   */
  private static mapApiTransaction(tx: any): Transaction {
    if (!tx) return {} as Transaction;

    const rawId = tx.id || tx.transactionId || tx._id || '';
    const txCustomId =
      tx.customId ||
      tx.displayId ||
      tx.receiptNo ||
      tx.transactionCode ||
      tx.customTransactionId ||
      (tx.transactionId && !/^[0-9a-fA-F-]{24,36}$/.test(tx.transactionId) ? tx.transactionId : null) ||
      (rawId && !/^[0-9a-fA-F-]{24,36}$/.test(rawId) ? rawId : null) ||
      tx.transactionId ||
      rawId;

    const rawCustId = tx.customer?.id || tx.customerId || '';
    const custCustomId =
      tx.customer?.customId ||
      tx.customer?.displayId ||
      tx.customer?.customerId ||
      tx.customerCode ||
      (tx.customerId && !/^[0-9a-fA-F-]{24,36}$/.test(tx.customerId) ? tx.customerId : null) ||
      (rawCustId && !/^[0-9a-fA-F-]{24,36}$/.test(rawCustId) ? rawCustId : null) ||
      tx.customerId ||
      rawCustId;

    const rawWrkId = tx.worker?.id || tx.workerId || '';
    const wrkCustomId =
      tx.worker?.customId ||
      tx.worker?.displayId ||
      tx.worker?.workerId ||
      tx.workerCode ||
      (tx.workerId && !/^[0-9a-fA-F-]{24,36}$/.test(tx.workerId) ? tx.workerId : null) ||
      (rawWrkId && !/^[0-9a-fA-F-]{24,36}$/.test(rawWrkId) ? rawWrkId : null) ||
      tx.workerId ||
      rawWrkId;

    const fuelAmt = Number(tx.amount ?? tx.fuelAmount ?? 0);
    const discPct = Number(
      tx.discountPercent ??
      tx.discountPercentage ??
      tx.customer?.group?.discountPercent ??
      tx.customer?.group?.discountPercentage ??
      0
    );
    const discAmt = Number(tx.discountAmount ?? ((fuelAmt * discPct) / 100));
    const finalAmt = Number(tx.finalAmount ?? (fuelAmt - discAmt));

    return {
      ...tx,
      id: rawId,
      transactionId: txCustomId,
      customerId: custCustomId,
      workerId: wrkCustomId,
      workerName: tx.workerName || tx.worker?.fullName || tx.worker?.name || '',
      fuelAmount: fuelAmt,
      customerName: tx.customerName || tx.customer?.fullName || tx.customer?.name || '',
      customerMobile: tx.customerMobile || tx.customer?.user?.mobile || tx.customer?.mobile || '',
      groupName: tx.groupName || tx.customer?.group?.groupName || tx.customer?.group?.name || '',
      groupType: tx.groupType || tx.customer?.group?.groupType || tx.customer?.group?.type || '',
      discountPercentage: discPct,
      discountAmount: Number(discAmt.toFixed(2)),
      finalAmount: Number(finalAmt.toFixed(2)),
      branchName: tx.branchName || tx.stationName || tx.petrolPumpName || tx.station?.name || '',
      createdAt: tx.createdAt || tx.date || new Date().toISOString(),
      status: (tx.status || 'COMPLETED').toUpperCase(),
    } as Transaction;
  }

  /**
   * Fetch customer profile via GET /api/v1/worker-app/customer/:id
   */
  static async getCustomerById(id: string): Promise<any> {
    let response = await apiClient.get<any>(`/worker-app/customer/${id}`);
    if (!response.success) {
      response = await apiClient.get<any>(`/customer/${id}`);
    }
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch customer details.');
  }

  /**
   * Calculate transaction breakdown via POST /api/v1/worker-app/transactions/calculate
   */
  static async calculateTransaction(payload: {
    customerId: string;
    qrSessionId: string;
    fuelAmount: number;
    discountPercentage: number;
  }): Promise<{
    customer: any;
    display: {
      customer: string;
      customerId: string;
      groupFleet: string;
      branchTerminal: string;
      attendant: string;
      calculatedRedemptionBadge: string;
      enteredFuelAmount: string;
      groupSavings: string;
      collectFromCustomer: string;
    };
  }> {
    let response = await apiClient.post<any>('/worker-app/transactions/calculate', payload);
    if (!response.success) {
      response = await apiClient.post<any>('/transactions/calculate', payload);
    }
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to calculate transaction.');
  }

  /**
   * Redeem a fuel transaction via API
   */
  static async redeem(payload: RedeemTransactionRequest): Promise<Transaction> {
    if (this.processedIdempotencyKeys.has(payload.idempotencyKey)) {
      throw new Error('This redemption is currently being processed or has already been submitted.');
    }

    const response = await apiClient.post<RedeemTransactionResponse>('/transactions/submit', payload);

    if (response.success && response.data?.transaction) {
      this.processedIdempotencyKeys.add(payload.idempotencyKey);
      const tx = response.data.transaction as any;
      const custCustomId = tx.customer?.customId || tx.customerCode || (tx.customerId && !/^[0-9a-fA-F-]{24,36}$/.test(tx.customerId) ? tx.customerId : 'cust001');
      const wrkCustomId = tx.worker?.customId || tx.workerCode || (tx.workerId && !/^[0-9a-fA-F-]{24,36}$/.test(tx.workerId) ? tx.workerId : 'Nayra001');
      const txCustomId = tx.customId || tx.displayId || tx.transactionCode || (tx.transactionId && !/^[0-9a-fA-F-]{24,36}$/.test(tx.transactionId) ? tx.transactionId : 'TXN00001');
      return {
        ...tx,
        transactionId: txCustomId,
        customerId: custCustomId,
        workerId: wrkCustomId,
        workerName: tx.workerName || tx.worker?.fullName || '',
        fuelAmount: tx.amount || tx.fuelAmount || 0,
        customerName: tx.customerName || tx.customer?.fullName || 'Unknown Customer',
        customerMobile: tx.customerMobile || tx.customer?.user?.mobile || tx.customer?.mobile || 'N/A',
        groupName: tx.groupName || tx.customer?.group?.name || 'Standard',
        groupType: tx.groupType || tx.customer?.group?.type || 'N/A',
        discountPercentage: tx.discountPercent || tx.discountPercentage || tx.customer?.group?.discountPercentage || 0,
        discountAmount: tx.discountAmount || 0,
        finalAmount: tx.finalAmount || 0,
        branchName: tx.branchName || tx.petrolPumpName || 'Station',
      } as Transaction;
    }

    throw new Error(response.message || 'Failed to complete fuel redemption.');
  }

  /**
   * Record a cancelled transaction before redemption
   */
  static async recordCancelled(payload: RedeemTransactionRequest): Promise<Transaction | void> {
    try {
      const response = await apiClient.post<any>(`/transactions/${payload.idempotencyKey}/cancel`, payload);
      if (response.success && response.data?.transaction) {
        return response.data.transaction;
      }
    } catch {
      // Ignore if endpoint is optional
    }
  }

  /**
   * Get transaction history with date filters and search via API
   */
  static async getTransactions(params: HistoryFilterParams = { filterType: 'TODAY' }): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    hasMore: boolean;
  }> {
    const queryParams = new URLSearchParams();
    if (params.filterType) queryParams.append('filterType', params.filterType);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.searchQuery) queryParams.append('searchQuery', params.searchQuery);

    let response = await apiClient.get<any>(`/worker-app/transactions?${queryParams.toString()}`, {
      requiresAuth: true,
    });

    if (!response.success) {
      response = await apiClient.get<any>(`/transactions?${queryParams.toString()}`, {
        requiresAuth: true,
      });
    }

    if (response.success && response.data) {
      const rawData = response.data;
      const rawList = Array.isArray(rawData)
        ? rawData
        : rawData.transactions || rawData.data || [];

      const transactions = rawList.map((tx: any) => this.mapApiTransaction(tx));
      const total = rawData.total ?? rawData.totalCount ?? transactions.length;
      const hasMore = rawData.hasMore ?? false;

      return {
        transactions,
        total,
        page: params.page || 1,
        hasMore,
      };
    }

    throw new Error(response.message || 'Failed to fetch transaction history.');
  }

  /**
   * Get single transaction details via API
   */
  static async getTransactionDetails(id: string): Promise<Transaction> {
    let response = await apiClient.get<any>(`/worker-app/transactions/details/${id}`);
    if (!response.success) {
      response = await apiClient.get<any>(`/transactions/details/${id}`);
    }

    if (response.success && response.data) {
      return this.mapApiTransaction(response.data);
    }

    throw new Error(response.message || 'Failed to fetch transaction details.');
  }

  /**
   * Get Today's Summary Metrics for Worker Home Screen via API
   */
  static async getTodaySummary(): Promise<TodayStats> {
    let response = await apiClient.get<any>('/transactions/dashboard?period=today');
    if (!response.success) {
      response = await apiClient.get<any>('/transactions/today');
    }

    if (response.success && response.data) {
      const summary = response.data.summary || response.data;
      return {
        transactionCount: summary.transactionCount ?? summary.count ?? 0,
        totalFuelAmount: summary.totalFuelAmount ?? summary.fuelAmount ?? summary.totalAmount ?? 0,
        totalDiscountAmount: summary.totalDiscountAmount ?? summary.discountAmount ?? summary.totalDiscount ?? 0,
        totalFinalAmount: summary.totalFinalAmount ?? summary.finalAmount ?? summary.totalSpent ?? 0,
        date: new Date().toISOString(),
      };
    }

    throw new Error(response.message || 'Failed to fetch today stats.');
  }

  /**
   * Get This Month's Summary Metrics via API
   */
  static async getMonthlySummary(): Promise<TodayStats> {
    let response = await apiClient.get<any>('/transactions/dashboard?period=month');
    if (!response.success) {
      response = await apiClient.get<any>('/transactions/monthly-summary');
    }

    if (response.success && response.data) {
      const summary = response.data.summary || response.data;
      return {
        transactionCount: summary.transactionCount ?? summary.count ?? 0,
        totalFuelAmount: summary.totalFuelAmount ?? summary.fuelAmount ?? summary.totalAmount ?? 0,
        totalDiscountAmount: summary.totalDiscountAmount ?? summary.discountAmount ?? summary.totalDiscount ?? 0,
        totalFinalAmount: summary.totalFinalAmount ?? summary.finalAmount ?? summary.totalSpent ?? 0,
        date: new Date().toISOString(),
      };
    }

    throw new Error(response.message || 'Failed to fetch monthly stats.');
  }

  /**
   * Get This Year's Summary Metrics via API
   */
  static async getYearlySummary(): Promise<TodayStats> {
    let response = await apiClient.get<any>('/transactions/dashboard?period=year');
    if (!response.success) {
      response = await apiClient.get<any>('/transactions/yearly-summary');
    }

    if (response.success && response.data) {
      const summary = response.data.summary || response.data;
      return {
        transactionCount: summary.transactionCount ?? summary.count ?? 0,
        totalFuelAmount: summary.totalFuelAmount ?? summary.fuelAmount ?? summary.totalAmount ?? 0,
        totalDiscountAmount: summary.totalDiscountAmount ?? summary.discountAmount ?? summary.totalDiscount ?? 0,
        totalFinalAmount: summary.totalFinalAmount ?? summary.finalAmount ?? summary.totalSpent ?? 0,
        date: new Date().toISOString(),
      };
    }

    throw new Error(response.message || 'Failed to fetch yearly stats.');
  }

  /**
   * Cancel a fuel transaction via API
   */
  static async cancelTransaction(transactionId: string): Promise<Transaction> {
    const response = await apiClient.post<{ message: string; transaction: Transaction }>(
      `/transactions/${transactionId}/cancel`,
      {}
    );

    if (response.success && response.data?.transaction) {
      return response.data.transaction;
    }

    throw new Error(response.message || 'Failed to cancel transaction.');
  }
}
