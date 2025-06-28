export interface AnalyticsData {
  platformMetrics: {
    totalProjects: number;
    successRate: number;
    avgProjectValue: number;
    clientSatisfaction: number;
  };
  expertMetrics: {
    activeExperts: number;
    avgResponseTime: string;
    expertRetention: number;
    avgRating: number;
  };
  revenueData: Array<{
    period: string;
    value: number;
    target?: number;
  }>;
  projectData: Array<{
    period: string;
    value: number;
  }>;
  categoryData: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  ratingDistribution: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStars: number;
  };
  changes?: {
    totalProjects: number;
    successRate: number;
    avgProjectValue: number;
    clientSatisfaction: number;
  };
}

class AnalyticsApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }

  async getAnalyticsData(timeRange: string = '30d'): Promise<AnalyticsData> {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data; // Extract data from the response wrapper
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  async getExpertAnalytics(expertId?: string): Promise<any> {
    try {
      const url = expertId ? `/api/analytics/expert/${expertId}` : '/api/analytics/expert';
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data; // Extract data from the response wrapper
    } catch (error) {
      console.error('Error fetching expert analytics:', error);
      throw error;
    }
  }

  async getClientAnalytics(clientId?: string): Promise<any> {
    try {
      const url = clientId ? `/api/analytics/client/${clientId}` : '/api/analytics/client';
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data; // Extract data from the response wrapper
    } catch (error) {
      console.error('Error fetching client analytics:', error);
      throw error;
    }
  }

  async getPlatformAnalytics(timeRange: string = '30d'): Promise<any> {
    try {
      const response = await fetch(`/api/analytics/platform?timeRange=${timeRange}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      throw error;
    }
  }
}

export const analyticsApi = new AnalyticsApiService();
