import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected, skipping connection');
      return;
    }

    console.log('Connecting to Socket.IO server with token:', token ? 'Token present' : 'No token');
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server with socket ID:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    // Set up notification listeners
    this.setupNotificationListeners();

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId: string) {
    if (this.socket) {
      console.log('Joining conversation:', conversationId);
      this.socket.emit('join_conversation', conversationId);
    } else {
      console.error('Cannot join conversation - socket not connected');
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      console.log('Leaving conversation:', conversationId);
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  sendMessage(data: {
    conversationId: string;
    content: string;
    receiverId: string;
    messageType?: 'text' | 'file' | 'image';
  }) {
    console.log('SocketService.sendMessage called with:', data);
    console.log('Socket connected:', this.socket?.connected);
    if (this.socket) {
      this.socket.emit('send_message', data);
      console.log('Message emitted via socket');
    } else {
      console.error('Socket not connected, cannot send message');
    }
  }

  startTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  markMessagesAsRead(conversationId: string) {
    if (this.socket) {
      this.socket.emit('mark_messages_read', { conversationId });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      console.log('Setting up new message listener');
      this.socket.off('new_message'); // Remove existing listener
      this.socket.on('new_message', (message) => {
        console.log('Received new_message event:', message);
        callback(message);
      });
    }
  }

  onMessageNotification(callback: (data: any) => void) {
    if (this.socket) {
      console.log('Setting up message notification listener');
      this.socket.off('message_notification'); // Remove existing listener
      this.socket.on('message_notification', (data) => {
        console.log('Received message_notification event:', data);
        callback(data);
      });
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('user_typing'); // Remove existing listener
      this.socket.on('user_typing', callback);
    }
  }

  onUserStopTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('user_stop_typing'); // Remove existing listener
      this.socket.on('user_stop_typing', callback);
    }
  }

  onMessagesRead(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('messages_read'); // Remove existing listener
      this.socket.on('messages_read', callback);
    }
  }

  onMessageError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.off('message_error'); // Remove existing listener
      this.socket.on('message_error', callback);
    }
  }

  onConversationDeleted(callback: (data: { conversationId: string; deletedBy: string }) => void) {
    if (this.socket) {
      console.log('Setting up conversation deleted listener');
      this.socket.off('conversation_deleted'); // Remove existing listener
      this.socket.on('conversation_deleted', (data) => {
        console.log('Received conversation_deleted event:', data);
        callback(data);
      });
    }
  }

  removeAllListeners() {
    if (this.socket) {
      console.log('Removing all socket listeners');
      this.socket.removeAllListeners('new_message');
      this.socket.removeAllListeners('message_notification');
      this.socket.removeAllListeners('user_typing');
      this.socket.removeAllListeners('user_stop_typing');
      this.socket.removeAllListeners('messages_read');
      this.socket.removeAllListeners('message_error');
      this.socket.removeAllListeners('conversation_deleted');
    }
  }

  removeMessageListeners() {
    if (this.socket) {
      console.log('Removing message-related socket listeners');
      this.socket.removeAllListeners('new_message');
      this.socket.removeAllListeners('message_notification');
      this.socket.removeAllListeners('messages_read');
    }
  }

  removeTypingListeners() {
    if (this.socket) {
      console.log('Removing typing-related socket listeners');
      this.socket.removeAllListeners('user_typing');
      this.socket.removeAllListeners('user_stop_typing');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Notification methods
  private setupNotificationListeners() {
    if (this.socket) {
      console.log('Setting up notification listeners');
    }
  }

  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      console.log('Setting up notification listener');
      this.socket.off('notification');
      this.socket.on('notification', (notification) => {
        console.log('Received notification event:', notification);
        callback(notification);
      });
    }
  }

  onNotificationCountUpdate(callback: (data: { unreadCount: number }) => void) {
    if (this.socket) {
      console.log('Setting up notification count update listener');
      this.socket.off('notification_count_update');
      this.socket.on('notification_count_update', (data) => {
        console.log('Received notification count update:', data);
        callback(data);
      });
    }
  }

  removeNotificationListeners() {
    if (this.socket) {
      console.log('Removing notification listeners');
      this.socket.removeAllListeners('notification');
      this.socket.removeAllListeners('notification_count_update');
    }
  }
}

export const socketService = new SocketService();
export const socket = socketService; // Export for backward compatibility
