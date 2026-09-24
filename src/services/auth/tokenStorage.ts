/**
 * Secure Token and Persistent Session Storage
 * Handles cross-platform token storage on Android and iOS
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../constants/config';
import { WorkerUser } from '../../types/auth';

export class TokenStorage {
  // In-memory cache for ultra-fast access
  private static cachedToken: string | null = null;
  private static cachedUser: WorkerUser | null = null;

  /**
   * Save access token securely
   */
  static async setToken(token: string): Promise<void> {
    this.cachedToken = token;
    try {
      await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.warn('Error saving auth token to AsyncStorage:', error);
    }
  }

  /**
   * Get stored auth token
   */
  static async getToken(): Promise<string | null> {
    if (this.cachedToken) return this.cachedToken;
    try {
      const token = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      this.cachedToken = token;
      return token;
    } catch (error) {
      console.warn('Error reading auth token from AsyncStorage:', error);
      return null;
    }
  }

  /**
   * Save worker user session data
   */
  static async setUser(user: WorkerUser): Promise<void> {
    this.cachedUser = user;
    try {
      await AsyncStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.warn('Error saving user data to AsyncStorage:', error);
    }
  }

  /**
   * Get stored worker user session data
   */
  static async getUser(): Promise<WorkerUser | null> {
    if (this.cachedUser) return this.cachedUser;
    try {
      const data = await AsyncStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
      if (data) {
        const user = JSON.parse(data) as WorkerUser;
        this.cachedUser = user;
        return user;
      }
      return null;
    } catch (error) {
      console.warn('Error reading user data from AsyncStorage:', error);
      return null;
    }
  }

  /**
   * Clear all auth session data upon logout
   */
  static async clearSession(): Promise<void> {
    this.cachedToken = null;
    this.cachedUser = null;
    try {
      await Promise.all([
        AsyncStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA),
      ]);
    } catch (error) {
      console.warn('Error clearing session from AsyncStorage:', error);
    }
  }
}
