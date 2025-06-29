import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { socket } from '../services/socket';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    // Listen for new notifications
    const handleNotification = (notification: any) => {
      setUnreadCount(prev => prev + 1);
      setHasNewNotification(true);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id
        });
      }
      
      // Reset animation after 3 seconds
      setTimeout(() => setHasNewNotification(false), 3000);
    };

    // Listen for notification count updates
    const handleCountUpdate = (data: { unreadCount: number }) => {
      setUnreadCount(data.unreadCount);
    };

    socket.onNotification(handleNotification);
    socket.onNotificationCountUpdate(handleCountUpdate);

    // Request notification permission on mount
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.removeNotificationListeners();
    };
  }, []);

  const handleClick = () => {
    setIsOpen(true);
    setHasNewNotification(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors ${className} ${
          hasNewNotification ? 'animate-bounce' : ''
        }`}
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
};

export default NotificationBell;
