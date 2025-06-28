import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Star,
  DollarSign,
  FileText,
  Settings,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { projectApi, Project } from '../../services/projectApi';

interface ExpertStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: string;
}

export const ExpertDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ExpertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectsData, projectStats] = await Promise.all([
        projectApi.getExpertProjects(),
        projectApi.getProjectStats()
      ]);
      
      setProjects(projectsData);
      
      // Transform project stats to expert stats
      const expertStats: ExpertStats = {
        totalProjects: projectStats.totalProjects,
        activeProjects: projectStats.activeProjects,
        completedProjects: projectStats.totalProjects - projectStats.activeProjects,
        totalEarnings: projectStats.totalInvestment, // Using investment as earnings proxy
        averageRating: 4.9, // This would come from reviews API
        responseTime: '2 hours' // This would come from analytics API
      };
      
      setStats(expertStats);
    } catch (err) {
      console.error('Error fetching expert dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-error-600 mx-auto mb-4" />
          <p className="text-error-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expert Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your projects and track your performance</p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Projects</h3>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.description || 'No description available'}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">
                          Budget: ${project.budget.allocated.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          Due: {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                      {project.progress > 0 && (
                        <div className="text-right">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Proposal
                </Button>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{stats.responseTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium">
                    {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Client Satisfaction</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{stats.averageRating}/5</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {projects.slice(0, 3).map((project, index) => (
                  <div key={project._id} className="text-sm">
                    <p className="text-gray-900 font-medium">
                      {index === 0 && 'Project milestone completed'}
                      {index === 1 && 'New message received'}
                      {index === 2 && 'Payment received'}
                    </p>
                    <p className="text-gray-600">{project.name}</p>
                    <p className="text-gray-500 text-xs">
                      {index === 0 && '2 hours ago'}
                      {index === 1 && '4 hours ago'}
                      {index === 2 && '1 day ago'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};