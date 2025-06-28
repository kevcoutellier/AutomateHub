export interface Project {
  _id: string;
  name: string;
  description: string;
  clientId: string;
  expertId: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  budget: {
    allocated: number;
    spent: number;
  };
  progress: number;
  startDate: string;
  dueDate: string;
  nextMilestone?: string;
  roi?: {
    projected: number;
    current: number;
  };
  health?: 'excellent' | 'good' | 'at-risk' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalInvestment: number;
  totalROI: number;
  averageProgress: number;
}

class ProjectApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }

  async getClientProjects(): Promise<Project[]> {
    try {
      const response = await fetch('/api/projects/client', {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching client projects:', error);
      throw error;
    }
  }

  async getExpertProjects(): Promise<Project[]> {
    try {
      const response = await fetch('/api/projects/expert', {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching expert projects:', error);
      throw error;
    }
  }

  async getProjectStats(): Promise<ProjectStats> {
    try {
      const response = await fetch('/api/projects/stats', {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  }

  async getProject(projectId: string): Promise<Project> {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }
}

export const projectApi = new ProjectApiService();
