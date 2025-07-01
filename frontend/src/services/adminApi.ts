const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface AdminStats {
  totalUsers: number;
  activeProjects: number;
  pendingReports: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivity: ActivityItem[];
  pendingActions: PendingAction[];
}

export interface ActivityItem {
  id: string;
  type: 'user_registration' | 'expert_verification' | 'report_submitted' | 'system_maintenance';
  title: string;
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface PendingAction {
  id: string;
  type: 'report_moderation' | 'expert_verification' | 'system_update';
  title: string;
  description: string;
  count: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl: string;
}

export interface AdminAnalytics {
  metrics: {
    userGrowth: {
      current: number;
      previous: number;
      change: number;
    };
    revenue: {
      current: number;
      previous: number;
      change: number;
    };
    projects: {
      current: number;
      previous: number;
      change: number;
    };
    satisfaction: {
      current: number;
      previous: number;
      change: number;
    };
  };
  chartData: {
    userRegistrations: Array<{ date: string; count: number }>;
    projectsByCategory: Array<{ category: string; count: number; percentage: number }>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  };
  topExperts: Array<{
    id: string;
    name: string;
    projects: number;
    rating: number;
    revenue: number;
  }>;
  systemHealth: {
    server: 'healthy' | 'warning' | 'critical';
    database: 'healthy' | 'warning' | 'critical';
    api: 'healthy' | 'warning' | 'critical';
  };
}

class AdminApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Dashboard
  async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await this.request('/admin/dashboard/stats');
      
      if (response.success && response.data) {
        return {
          totalUsers: response.data.totalUsers,
          activeProjects: response.data.activeProjects,
          pendingReports: response.data.pendingReports,
          systemHealth: response.data.systemHealth,
          recentActivity: response.data.recentActivity || [],
          pendingActions: response.data.pendingActions || []
        };
      }
      
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn('Admin API not available, using mock data');
      return {
        totalUsers: 1247,
        activeProjects: 89,
        pendingReports: 3,
        systemHealth: 'healthy',
        recentActivity: [
          {
            id: '1',
            type: 'expert_verification',
            title: 'Nouvel expert vérifié',
            description: 'Marie Dubois - Développement Web',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            type: 'report_submitted',
            title: 'Nouveau signalement',
            description: 'Projet #1234 - Comportement inapproprié',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            severity: 'high'
          }
        ],
        pendingActions: [
          {
            id: '1',
            type: 'report_moderation',
            title: '3 signalements en attente',
            description: 'Nécessitent une modération',
            count: 3,
            priority: 'high',
            actionUrl: '/admin?tab=reports'
          }
        ]
      };
    }
  }

  async getSystemHealth() {
    try {
      const response = await this.request('/admin/system/health');
      return response.data?.health || {
        database: 'healthy',
        server: 'healthy',
        storage: 'healthy'
      };
    } catch (error) {
      return {
        database: 'healthy',
        server: 'healthy',
        storage: 'healthy'
      };
    }
  }

  async refreshDashboard() {
    try {
      const response = await this.request('/admin/dashboard/refresh', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      throw error;
    }
  }

  // Dashboard Actions
  async exportDashboard(format: 'json' | 'csv' = 'json') {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/export?format=${format}`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'admin-dashboard-export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return { success: true, message: 'Export downloaded' };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      throw error;
    }
  }

  // Quick Actions
  async moderateReports(reportIds: string[], action: 'approve' | 'reject', reason?: string) {
    try {
      const response = await this.request('/admin/actions/moderate-reports', {
        method: 'POST',
        body: JSON.stringify({ reportIds, action, reason })
      });
      return response;
    } catch (error) {
      console.error('Error moderating reports:', error);
      throw error;
    }
  }

  async verifyExperts(expertIds: string[], action: 'approve' | 'reject') {
    try {
      const response = await this.request('/admin/actions/verify-experts', {
        method: 'POST',
        body: JSON.stringify({ expertIds, action })
      });
      return response;
    } catch (error) {
      console.error('Error verifying experts:', error);
      throw error;
    }
  }

  async manageUsers(userIds: string[], action: 'suspend' | 'activate', reason?: string) {
    try {
      const response = await this.request('/admin/actions/manage-users', {
        method: 'POST',
        body: JSON.stringify({ userIds, action, reason })
      });
      return response;
    } catch (error) {
      console.error('Error managing users:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await this.request(`/admin/users?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(userId: string) {
    try {
      const response = await this.request(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async suspendUser(userId: string, reason: string) {
    try {
      const response = await this.request(`/admin/users/${userId}/suspend`, {
        method: 'PUT',
        body: JSON.stringify({ reason })
      });
      return response;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  async activateUser(userId: string) {
    try {
      const response = await this.request(`/admin/users/${userId}/activate`, {
        method: 'PUT'
      });
      return response;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: 'client' | 'expert' | 'admin') {
    try {
      const response = await this.request(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
      return response;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Reports Management
  async getReports(params?: {
    status?: string;
    severity?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await this.request(`/admin/reports?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  async getReport(reportId: string) {
    try {
      const response = await this.request(`/admin/reports/${reportId}`);
      return response;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  async updateReport(reportId: string, data: {
    status?: string;
    adminNotes?: string;
    resolution?: string;
  }) {
    try {
      const response = await this.request(`/admin/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }

  async escalateReport(reportId: string, data: {
    severity: string;
    escalationReason: string;
  }) {
    try {
      const response = await this.request(`/admin/reports/${reportId}/escalate`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('Error escalating report:', error);
      throw error;
    }
  }

  // Analytics
  async getAnalytics(timeRange: string = '30d'): Promise<AdminAnalytics> {
    try {
      const response = await this.request(`/admin/analytics?timeRange=${timeRange}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn('Admin Analytics API not available, using mock data');
      // Fallback vers des données mock
      return {
        metrics: {
          userGrowth: { current: 1247, previous: 1156, change: 7.9 },
          revenue: { current: 45600, previous: 38200, change: 19.4 },
          projects: { current: 89, previous: 76, change: 17.1 },
          satisfaction: { current: 4.7, previous: 4.5, change: 4.4 }
        },
        chartData: {
          userRegistrations: [
            { date: '2024-01-01', count: 12 },
            { date: '2024-01-02', count: 15 },
            { date: '2024-01-03', count: 8 },
            { date: '2024-01-04', count: 22 },
            { date: '2024-01-05', count: 18 }
          ],
          projectsByCategory: [
            { category: 'Développement Web', count: 45, percentage: 35 },
            { category: 'Design', count: 28, percentage: 22 },
            { category: 'Marketing', count: 20, percentage: 16 },
            { category: 'Consulting', count: 18, percentage: 14 },
            { category: 'Autres', count: 16, percentage: 13 }
          ],
          revenueByMonth: [
            { month: 'Oct', revenue: 32000 },
            { month: 'Nov', revenue: 38200 },
            { month: 'Déc', revenue: 45600 },
            { month: 'Jan', revenue: 52100 }
          ]
        },
        topExperts: [
          { id: '1', name: 'Marie Dubois', projects: 12, rating: 4.9, revenue: 15600 },
          { id: '2', name: 'Pierre Martin', projects: 8, rating: 4.8, revenue: 12400 },
          { id: '3', name: 'Sophie Durand', projects: 10, rating: 4.7, revenue: 11200 },
          { id: '4', name: 'Jean Moreau', projects: 6, rating: 4.9, revenue: 9800 }
        ],
        systemHealth: {
          server: 'healthy',
          database: 'healthy',
          api: 'warning'
        }
      };
    }
  }
}

export const adminApi = new AdminApiService();
export default adminApi;
