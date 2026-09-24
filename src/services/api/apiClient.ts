/**
 * Centralized API Client
 * Clean HTTP client with Bearer token injection, configurable timeout,
 * centralized error transformation, and mock fallback support.
 */
import { CONFIG } from '../../constants/config';
import { TokenStorage } from '../auth/tokenStorage';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  statusCode: number;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = CONFIG.API_BASE_URL, timeout: number = CONFIG.API_TIMEOUT) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeout = timeout;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Generic request method with timeout, headers & auth token
   */
  public async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      requiresAuth?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
    } = options;

    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
    const token = requiresAuth ? await TokenStorage.getToken() : null;

    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    if (token) {
      reqHeaders.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
          message: json?.message || `Request failed with status ${response.status}`,
          error: {
            code: json?.error?.code || `HTTP_${response.status}`,
            message: json?.error?.message || json?.message || 'Server returned an error',
            details: json?.error?.details,
          },
        };
      }

      return {
        success: true,
        data: json?.data !== undefined ? json.data : json,
        message: json?.message,
        statusCode: response.status,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isTimeout = err.name === 'AbortError';
      return {
        success: false,
        statusCode: isTimeout ? 408 : 0,
        message: isTimeout
          ? 'Network request timed out. Please check your connection and try again.'
          : 'Unable to reach the server. Please verify your internet connection.',
        error: {
          code: isTimeout ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
          message: err?.message || 'Network error occurred',
        },
      };
    }
  }

  // Convenience helper methods
  public get<T>(endpoint: string, options?: { headers?: Record<string, string>; requiresAuth?: boolean }) {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  public post<T>(endpoint: string, body: any, options?: { headers?: Record<string, string>; requiresAuth?: boolean }) {
    return this.request<T>(endpoint, { method: 'POST', body, ...options });
  }

  public put<T>(endpoint: string, body: any, options?: { headers?: Record<string, string>; requiresAuth?: boolean }) {
    return this.request<T>(endpoint, { method: 'PUT', body, ...options });
  }

  public delete<T>(endpoint: string, options?: { headers?: Record<string, string>; requiresAuth?: boolean }) {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient();
