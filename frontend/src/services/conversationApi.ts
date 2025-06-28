const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  }>;
  expertId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  expertProfile?: {
    name: string;
    title: string;
    avatar: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  receiverId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  content: string;
  messageType: 'text' | 'file' | 'image';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

class ConversationApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    console.log('ConversationApi - Token from localStorage:', token ? 'Token exists' : 'No token found');
    console.log('ConversationApi - Full token:', token);
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async getConversations(): Promise<{ success: boolean; data?: Conversation[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return {
        success: false,
        message: 'Failed to fetch conversations'
      };
    }
  }

  async startConversation(expertId: string): Promise<{ success: boolean; data?: Conversation; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ expertId })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return {
        success: false,
        message: 'Failed to start conversation'
      };
    }
  }

  async getConversation(conversationId: string): Promise<{ success: boolean; data?: Conversation; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return {
        success: false,
        message: 'Failed to fetch conversation'
      };
    }
  }

  async getMessages(conversationId: string, page = 1, limit = 50): Promise<{ 
    success: boolean; 
    data?: { 
      messages: Message[]; 
      pagination: { page: number; limit: number; total: number; pages: number } 
    }; 
    message?: string 
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: false,
        message: 'Failed to fetch messages'
      };
    }
  }

  async sendMessage(conversationId: string, content: string, receiverId: string, messageType = 'text'): Promise<{ 
    success: boolean; 
    data?: Message; 
    message?: string 
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ content, receiverId, messageType })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: 'Failed to send message'
      };
    }
  }

  async markMessagesAsRead(conversationId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/read`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        success: false,
        message: 'Failed to mark messages as read'
      };
    }
  }

  async deleteConversation(conversationId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return {
        success: false,
        message: 'Failed to delete conversation'
      };
    }
  }
}

export const conversationApi = new ConversationApiService();
