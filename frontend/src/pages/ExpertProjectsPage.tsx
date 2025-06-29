import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/authStore';
import { projectApi, Project } from '../services/projectApi';

export const ExpertProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'planning' | 'in-progress' | 'review' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not expert
  useEffect(() => {
    if (user && user.role !== 'expert') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectApi.getExpertProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching expert projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health?: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'at-risk': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const projectStats = {
    total: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    review: projects.filter(p => p.status === 'review').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-2">Manage and track your active projects</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{projectStats.total}</p>
              <p className="text-sm text-gray-600">Total Projects</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{projectStats.planning}</p>
              <p className="text-sm text-gray-600">Planning</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{projectStats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{projectStats.review}</p>
              <p className="text-sm text-gray-600">Review</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{projectStats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Projects' },
              { key: 'planning', label: 'Planning' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'review', label: 'Review' },
              { key: 'completed', label: 'Completed' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <Card key={project._id} className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/project/${project._id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                    {project.health && (
                      <div className={`flex items-center gap-1 ${getHealthColor(project.health)}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          project.health === 'excellent' ? 'bg-green-500' :
                          project.health === 'good' ? 'bg-blue-500' :
                          project.health === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm capitalize">{project.health}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Budget: ${project.budget.allocated.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(project.dueDate).toLocaleDateString()}
                    </div>
                    {project.nextMilestone && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Next: {project.nextMilestone}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* ROI Information */}
                  {project.roi && (
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Projected ROI: </span>
                        <span className="font-medium text-green-600">
                          {project.roi.projected}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Current ROI: </span>
                        <span className="font-medium text-blue-600">
                          {project.roi.current}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/project/${project._id}`);
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your accepted projects will appear here'
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
