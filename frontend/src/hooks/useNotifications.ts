import { useState, useEffect, useCallback } from 'react';
import { notificationApi, type Notification, NotificationStats } from '../services/notificationApi';
import { socket } from '../services/socket';
import { useAuthStore } from '../stores/authStore';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Load notifications
  const loadNotifications = useCallback(async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
    priority?: string;
  }) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await notificationApi.getNotifications(params);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      return response;
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load notification stats
  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const statsData = await notificationApi.getNotificationStats();
      setStats(statsData);
      return statsData;
    } catch (err) {
      console.error('Error loading notification stats:', err);
    }
  }, [isAuthenticated]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const result = await notificationApi.markAsRead(notificationIds);
      setUnreadCount(result.unreadCount);
      
      // Update local notifications
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n._id) 
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      
      return result;
    } catch (err) {
      setError('Erreur lors du marquage comme lu');
      console.error('Error marking notifications as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationApi.markAllAsRead();
      setUnreadCount(0);
      
      // Update local notifications
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      
      return result;
    } catch (err) {
      setError('Erreur lors du marquage de toutes les notifications');
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete notifications
  const deleteNotifications = useCallback(async (notificationIds: string[]) => {
    try {
      const result = await notificationApi.deleteNotifications(notificationIds);
      setUnreadCount(result.unreadCount);
      
      // Remove from local notifications
      setNotifications(prev => 
        prev.filter(n => !notificationIds.includes(n._id))
      );
      
      return result;
    } catch (err) {
      setError('Erreur lors de la suppression des notifications');
      console.error('Error deleting notifications:', err);
    }
  }, []);

  // Delete all read notifications
  const deleteReadNotifications = useCallback(async () => {
    try {
      const result = await notificationApi.deleteReadNotifications();
      
      // Remove read notifications from local state
      setNotifications(prev => prev.filter(n => !n.isRead));
      
      return result;
    } catch (err) {
      setError('Erreur lors de la suppression des notifications lues');
      console.error('Error deleting read notifications:', err);
    }
  }, []);

  // Get notification by ID
  const getNotification = useCallback(async (id: string) => {
    try {
      const notification = await notificationApi.getNotification(id);
      
      // Update local notification if it exists
      setNotifications(prev => 
        prev.map(n => n._id === id ? notification : n)
      );
      
      // Update unread count if notification was marked as read
      if (!notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return notification;
    } catch (err) {
      setError('Erreur lors de la récupération de la notification');
      console.error('Error getting notification:', err);
    }
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification._id
        });
      }
    };

    const handleCountUpdate = (data: { unreadCount: number }) => {
      setUnreadCount(data.unreadCount);
    };

    socket.onNotification(handleNewNotification);
    socket.onNotificationCountUpdate(handleCountUpdate);

    return () => {
      socket.removeNotificationListeners();
    };
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications({ limit: 20 });
      loadStats();
    } else {
      // Clear notifications when not authenticated
      setNotifications([]);
      setUnreadCount(0);
      setStats(null);
    }
  }, [isAuthenticated, loadNotifications, loadStats]);

  return {
    notifications,
    unreadCount,
    stats,
    loading,
    error,
    loadNotifications,
    loadStats,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    deleteReadNotifications,
    getNotification,
    clearError: () => setError(null)
  };
};
