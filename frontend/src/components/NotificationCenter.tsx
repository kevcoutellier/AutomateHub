import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Filter, AlertCircle, MessageSquare, Briefcase, Target, CreditCard, Settings } from 'lucide-react';
import { notificationApi, Notification, NotificationResponse } from '../services/notificationApi';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  unreadCount,
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{
    type?: string;
    isRead?: boolean;
    priority?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  // Load notifications
  const loadNotifications = async (resetPage = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const response: NotificationResponse = await notificationApi.getNotifications({
        page: currentPage,
        limit: 20,
        ...filter
      });

      if (resetPage) {
        setNotifications(response.notifications);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setHasMore(response.pagination.hasNext);
      onUnreadCountChange(response.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications when component opens or filter changes
  useEffect(() => {
    if (isOpen) {
      loadNotifications(true);
    }
  }, [isOpen, filter]);

  // Load more notifications
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      loadNotifications();
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead([notificationId]);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      onUnreadCountChange(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      onUnreadCountChange(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationApi.deleteNotifications([notificationId]);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-5 h-5 ${priority === 'urgent' ? 'text-red-500' : 
      priority === 'high' ? 'text-orange-500' : 
      priority === 'medium' ? 'text-blue-500' : 'text-gray-500'}`;

    switch (type) {
      case 'message':
        return <MessageSquare className={iconClass} />;
      case 'project_update':
        return <Briefcase className={iconClass} />;
      case 'milestone_update':
        return <Target className={iconClass} />;
      case 'expert_match':
        return <AlertCircle className={iconClass} />;
      case 'payment':
        return <CreditCard className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value || undefined }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Tous les types</option>
              <option value="message">Messages</option>
              <option value="project_update">Projets</option>
              <option value="milestone_update">Jalons</option>
              <option value="expert_match">Experts</option>
              <option value="payment">Paiements</option>
              <option value="system">Système</option>
            </select>
            <select
              value={filter.isRead === undefined ? '' : filter.isRead.toString()}
              onChange={(e) => setFilter(prev => ({ 
                ...prev, 
                isRead: e.target.value === '' ? undefined : e.target.value === 'true' 
              }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Tous</option>
              <option value="false">Non lus</option>
              <option value="true">Lus</option>
            </select>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tout marquer lu</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <Bell className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-center">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${
                            !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification._id);
                              }}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                              title="Marquer comme lu"
                            >
                              <Check className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="p-4 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? 'Chargement...' : 'Charger plus'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
