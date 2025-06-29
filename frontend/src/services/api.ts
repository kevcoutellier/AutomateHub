// API client service for AutomateHub backend
import { Expert, Project, Review, AssessmentResult, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'client' | 'expert';
  }) {
    const response = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
      // Store user ID for messaging system
      if (response.data.user?.id) {
        localStorage.setItem('userId', response.data.user.id);
      }
    }
    
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
      // Store user ID for messaging system
      if (response.data.user?.id) {
        localStorage.setItem('userId', response.data.user.id);
      }
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Expert methods
  async getExperts(params?: {
    page?: number;
    limit?: number;
    specialties?: string[];
    industries?: string[];
    availability?: string;
    minRating?: number;
    maxRate?: number;
    location?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    const query = searchParams.toString();
    return this.request<{ experts: Expert[]; pagination: any }>(`/experts${query ? `?${query}` : ''}`);
  }

  async getExpert(id: string) {
    return this.request<{ expert: Expert; reviews: Review[] }>(`/experts/${id}`);
  }

  async createExpertProfile(expertData: any) {
    return this.request('/experts', {
      method: 'POST',
      body: JSON.stringify(expertData),
    });
  }

  async updateExpertProfile(id: string, expertData: any) {
    return this.request(`/experts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expertData),
    });
  }

  async getMyExpertProfile() {
    return this.request('/experts/me/profile');
  }

  async getExpertStats(id: string) {
    return this.request(`/experts/${id}/stats`);
  }

  // Project methods
  async getProjects(params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request<{ projects: Project[]; pagination: any }>(`/projects${query ? `?${query}` : ''}`);
  }

  async getProject(id: string) {
    return this.request<{ project: Project }>(`/projects/${id}`);
  }

  async createProject(projectData: {
    title: string;
    description: string;
    budget: { total: number; currency?: string };
    startDate: string;
    endDate?: string;
    expertId: string;
  }) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async updateProjectProgress(id: string, progress: number) {
    return this.request(`/projects/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  async addMilestone(projectId: string, milestoneData: {
    title: string;
    description: string;
    dueDate: string;
    deliverables?: string[];
  }) {
    return this.request(`/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
  }

  async sendMessage(projectId: string, messageData: {
    content: string;
    messageType?: string;
    attachments?: string[];
  }) {
    return this.request(`/projects/${projectId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getProjectMessages(projectId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/projects/${projectId}/messages${query ? `?${query}` : ''}`);
  }

  // Review methods
  async getReviews(params?: {
    page?: number;
    limit?: number;
    expertId?: string;
    minRating?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request<{ reviews: Review[]; pagination: any }>(`/reviews${query ? `?${query}` : ''}`);
  }

  async createReview(reviewData: {
    projectId: string;
    rating: number;
    comment: string;
    aspects: {
      communication: number;
      quality: number;
      timeliness: number;
      expertise: number;
    };
  }) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getExpertReviews(expertId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/reviews/expert/${expertId}${query ? `?${query}` : ''}`);
  }

  async getMyReviews(params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/reviews/client/my-reviews${query ? `?${query}` : ''}`);
  }

  // Assessment methods
  async submitAssessment(assessmentData: any) {
    return this.request('/assessment', {
      method: 'POST',
      body: JSON.stringify({ assessmentData }),
    });
  }

  async getMyAssessments(params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request<{ assessments: AssessmentResult[]; pagination: any }>(`/assessment/my-assessments${query ? `?${query}` : ''}`);
  }

  async getAssessment(id: string) {
    return this.request<{ assessment: AssessmentResult }>(`/assessment/${id}`);
  }

  async getAssessmentResults(id: string) {
    return this.request(`/assessment/${id}/results`);
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userId');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Notification methods
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
    priority?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/notifications${query ? `?${query}` : ''}`);
  }

  async getNotificationStats() {
    return this.request('/notifications/stats');
  }

  async markNotificationsAsRead(notificationIds: string[]) {
    return this.request('/notifications/read', {
      method: 'PUT',
      body: JSON.stringify({ notificationIds }),
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotifications(notificationIds: string[]) {
    return this.request('/notifications', {
      method: 'DELETE',
      body: JSON.stringify({ notificationIds }),
    });
  }

  async deleteReadNotifications() {
    return this.request('/notifications/read', {
      method: 'DELETE',
    });
  }

  async getNotification(id: string) {
    return this.request(`/notifications/${id}`);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for convenience
export type { ApiResponse };
