/**
 * In-App Notification Context
 * Alerts the worker of real-time transactions, account updates & admin broadcasts.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationService, AppNotification } from '../services/notifications/notificationService';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  latestNotification: AppNotification | null;
  dismissLatest: () => void;
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null);

  useEffect(() => {
    NotificationService.init();
    setNotifications(NotificationService.getNotifications());

    const unsubscribe = NotificationService.subscribe(newNotif => {
      setNotifications(prev => [newNotif, ...prev]);
      setLatestNotification(newNotif);
    });

    return () => unsubscribe();
  }, []);

  const dismissLatest = () => {
    setLatestNotification(null);
  };

  const markAsRead = (id: string) => {
    NotificationService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        latestNotification,
        dismissLatest,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
