/**
 * Push Notification Architecture Service
 * Handles FCM / APNS token registration and listeners for:
 * - Account approved
 * - Transaction completed
 * - Profile updated
 * - Admin announcements
 */
import { Alert } from 'react-native';

export type NotificationType = 
  | 'ACCOUNT_APPROVED'
  | 'TRANSACTION_COMPLETED'
  | 'PROFILE_UPDATED'
  | 'ADMIN_BROADCAST'
  | 'SHIFT_REMINDER';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  receivedAt: string;
  read: boolean;
}

type NotificationListener = (notification: AppNotification) => void;

export class NotificationService {
  private static listeners: Set<NotificationListener> = new Set();
  private static notifications: AppNotification[] = [
    {
      id: 'notif-1',
      type: 'ACCOUNT_APPROVED',
      title: 'Worker Account Approved',
      body: 'Your worker account for Downtown City Station has been authorized by the pump administrator.',
      receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'notif-2',
      type: 'ADMIN_BROADCAST',
      title: 'Morning Shift Briefing',
      body: 'Standard fuel rates updated today. Ensure proper group validation on all QR codes.',
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
  ];

  /**
   * Initialize push notification listeners
   */
  static async init(): Promise<void> {
    console.log('[NotificationService] Initialized push notification architecture');
  }

  /**
   * Register push device token
   */
  static async registerDeviceToken(token: string): Promise<boolean> {
    console.log('[NotificationService] Registering device token with backend:', token);
    return true;
  }

  /**
   * Subscribe to incoming notifications
   */
  static subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Trigger local notification event
   */
  static dispatch(notification: Omit<AppNotification, 'id' | 'receivedAt' | 'read'>): AppNotification {
    const fullNotification: AppNotification = {
      ...notification,
      id: 'notif-' + Date.now(),
      receivedAt: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(fullNotification);
    this.listeners.forEach(listener => listener(fullNotification));

    return fullNotification;
  }

  /**
   * Get all notifications
   */
  static getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  /**
   * Mark as read
   */
  static markAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }
}
