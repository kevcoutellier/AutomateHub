import React, { useState } from 'react';
import { Bell, Send, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from '../components/ui/Button';

const NotificationTestPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    clearError
  } = useNotifications();

  const [testMessage, setTestMessage] = useState('');
  const [testType, setTestType] = useState<'message' | 'project_update' | 'milestone_update' | 'expert_match' | 'payment' | 'system'>('message');
  const [testPriority, setTestPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Simulate sending a test notification (for development purposes)
  const sendTestNotification = async () => {
    if (!testMessage.trim()) return;

    // This would typically be done through a real API call
    // For testing, we can use the socket connection to simulate
    console.log('Test notification:', {
      type: testType,
      title: `Test ${testType}`,
      message: testMessage,
      priority: testPriority
    });

    setTestMessage('');
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-5 h-5 ${
      priority === 'urgent' ? 'text-red-500' : 
      priority === 'high' ? 'text-orange-500' : 
      priority === 'medium' ? 'text-blue-500' : 'text-gray-500'
    }`;

    switch (type) {
      case 'message':
        return <Bell className={iconClass} />;
      case 'project_update':
        return <Info className={iconClass} />;
      case 'milestone_update':
        return <CheckCircle className={iconClass} />;
      case 'expert_match':
        return <AlertCircle className={iconClass} />;
      case 'payment':
        return <AlertTriangle className={iconClass} />;
      case 'system':
        return <Info className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="w-8 h-8 mr-3 text-blue-600" />
              Système de Notifications - Test
            </h1>
            <p className="text-gray-600 mt-2">
              Page de test pour le système de notifications en temps réel
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
                <div className="text-sm text-blue-800">Non lues</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats?.read || 0}</div>
                <div className="text-sm text-green-800">Lues</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{stats?.total || 0}</div>
                <div className="text-sm text-gray-800">Total</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{notifications.length}</div>
                <div className="text-sm text-purple-800">Chargées</div>
              </div>
            </div>
          </div>

          {/* Test Notification Form */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tester une notification</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de notification
                  </label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="message">Message</option>
                    <option value="project_update">Mise à jour projet</option>
                    <option value="milestone_update">Mise à jour jalon</option>
                    <option value="expert_match">Correspondance expert</option>
                    <option value="payment">Paiement</option>
                    <option value="system">Système</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={testPriority}
                    onChange={(e) => setTestPriority(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message de test
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Entrez votre message de test..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={sendTestNotification}
                    disabled={!testMessage.trim()}
                    className="flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                variant="outline"
              >
                Marquer tout comme lu
              </Button>
              <Button
                onClick={() => deleteNotifications(notifications.filter(n => n.isRead).map(n => n._id))}
                disabled={!notifications.some(n => n.isRead)}
                variant="outline"
              >
                Supprimer les notifications lues
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Notifications récentes ({notifications.length})
            </h2>
            
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg border transition-colors ${
                      !notification.isRead 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
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
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {notification.priority}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead([notification._id])}
                              >
                                Marquer lu
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotifications([notification._id])}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTestPage;
