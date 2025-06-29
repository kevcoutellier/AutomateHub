import { apiClient } from './api';

export interface Notification {
  _id: string;
  type: 'message' | 'project_update' | 'milestone_update' | 'expert_match' | 'payment' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  typeStats: Record<string, number>;
  priorityStats: Record<string, number>;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  unreadCount: number;
}

class NotificationApi {
  /**
   * Get user notifications with pagination and filtering
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
    priority?: string;
  }): Promise<NotificationResponse> {
    const response = await apiClient.getNotifications(params);
    return response.data as NotificationResponse;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    const response = await apiClient.getNotificationStats();
    return response.data as NotificationStats;
  }

  /**
   * Mark specific notifications as read
   */
  async markAsRead(notificationIds: string[]): Promise<{ updatedCount: number; unreadCount: number }> {
    const response = await apiClient.markNotificationsAsRead(notificationIds);
    return response.data as { updatedCount: number; unreadCount: number };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ updatedCount: number; unreadCount: number }> {
    const response = await apiClient.markAllNotificationsAsRead();
    return response.data as { updatedCount: number; unreadCount: number };
  }

  /**
   * Delete specific notifications
   */
  async deleteNotifications(notificationIds: string[]): Promise<{ deletedCount: number; unreadCount: number }> {
    const response = await apiClient.deleteNotifications(notificationIds);
    return response.data as { deletedCount: number; unreadCount: number };
  }

  /**
   * Delete all read notifications
   */
  async deleteReadNotifications(): Promise<{ deletedCount: number }> {
    const response = await apiClient.deleteReadNotifications();
    return response.data as { deletedCount: number };
  }

  /**
   * Get notification by ID
   */
  async getNotification(id: string): Promise<Notification> {
    const response = await apiClient.getNotification(id);
    return response.data as Notification;
  }
}

export const notificationApi = new NotificationApi();
