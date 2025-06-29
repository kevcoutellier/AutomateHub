import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  MessageSquare, 
  DollarSign, 
  UserPlus, 
  AlertTriangle,
  Calendar,
  Settings,
  Filter
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface Notification {
  id: string;
  type: 'message' | 'payment' | 'project' | 'system' | 'milestone';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'messages' | 'payments'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Mock data for development
      setNotifications([
        {
          id: '1',
          type: 'message',
          title: 'Nouveau message',
          content: 'Marie Dubois vous a envoyé un message concernant le projet "App Mobile"',
          isRead: false,
          createdAt: '2024-01-20T10:30:00Z',
          actionUrl: '/projects/1/messages',
          priority: 'medium'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Paiement reçu',
          content: 'Vous avez reçu un paiement de 2500€ pour le projet "Site E-commerce"',
          isRead: false,
          createdAt: '2024-01-20T09:15:00Z',
          actionUrl: '/billing',
          priority: 'high'
        },
        {
          id: '3',
          type: 'milestone',
          title: 'Jalon terminé',
          content: 'Le jalon "Design UI/UX" a été marqué comme terminé',
          isRead: true,
          createdAt: '2024-01-19T16:45:00Z',
          actionUrl: '/projects/2',
          priority: 'low'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'payment': return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'project': return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'milestone': return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'system': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'messages': return notification.type === 'message';
      case 'payments': return notification.type === 'payment';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end pt-16 pr-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'unread', label: 'Non lues' },
              { key: 'messages', label: 'Messages' },
              { key: 'payments', label: 'Paiements' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 text-xs rounded-full ${
                  filter === key
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={markAllAsRead}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Marquer toutes comme lues
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-1">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? 'Toutes vos notifications ont été lues'
                  : 'Vous recevrez ici vos notifications importantes'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => {
              // Navigate to notification settings
              window.location.href = '/profile?tab=notifications';
            }}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres de notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
