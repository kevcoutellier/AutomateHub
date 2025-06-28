import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  MessageCircle, 
  Calendar, 
  AlertTriangle,
  Users,
  FileText,
  Download,
  Target,
  Zap,
  ArrowRight,
  MoreHorizontal,
  Loader2,
  Settings,
  Bell,
  Play
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { projectApi, Project, ProjectStats } from '../../services/projectApi';

export const ClientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectsData, statsData] = await Promise.all([
        projectApi.getClientProjects(),
        projectApi.getProjectStats()
      ]);
      
      setProjects(projectsData);
      setProjectStats(statsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-success-600 bg-success-100';
      case 'good': return 'text-primary-600 bg-primary-100';
      case 'at-risk': return 'text-warning-600 bg-warning-100';
      case 'critical': return 'text-error-600 bg-error-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-gray-600 bg-gray-100';
      case 'in-progress': return 'text-primary-600 bg-primary-100';
      case 'review': return 'text-warning-600 bg-warning-100';
      case 'completed': return 'text-success-600 bg-success-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const totalInvestment = projectStats?.totalInvestment || 0;
  const totalROI = projectStats?.totalROI || 0;
  const avgProgress = projectStats?.averageProgress || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, Client</h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your automation projects</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>{projects.filter(p => p.status === 'review').length}</span>
              </Button>
              <Button className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Message Expert
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{projectStats?.activeProjects || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600 font-medium">+12%</span>
                <span className="text-sm text-gray-600 ml-2">vs last month</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Investment</p>
                  <p className="text-2xl font-bold text-gray-900">${totalInvestment.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-success-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600 font-medium">+8%</span>
                <span className="text-sm text-gray-600 ml-2">vs last month</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ROI Generated</p>
                  <p className="text-2xl font-bold text-gray-900">${totalROI.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-warning-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600 font-medium">+23%</span>
                <span className="text-sm text-gray-600 ml-2">vs last month</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(avgProgress)}%</p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-secondary-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600 font-medium">+5%</span>
                <span className="text-sm text-gray-600 ml-2">vs last month</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'projects', label: 'Projects', icon: FileText },
              { id: 'resources', label: 'Resources', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Projects */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project._id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{project.description || 'No description available'}</p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Budget: </span>
                            <span className="font-medium">${project.budget.allocated.toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Spent: </span>
                            <span className="font-medium">${project.budget.spent.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Due: </span>
                          <span className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center justify-between mb-1">
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
                        {project.health && (
                          <Badge className={getHealthColor(project.health)}>
                            {project.health}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Opportunities */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Next Steps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-secondary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Inventory Management Automation</h3>
                        <p className="text-gray-600 text-sm">
                          Based on your order automation success, automate inventory tracking and reordering.
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Estimated ROI:</span>
                          <div className="font-medium text-success-600">$35,000/year</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Timeline:</span>
                          <div className="font-medium text-gray-900">3-4 weeks</div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full flex items-center justify-center gap-2">
                      <span>Explore Opportunity</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">HR Onboarding Workflow</h3>
                        <p className="text-gray-600 text-sm">
                          Streamline employee onboarding with automated document collection and training.
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Estimated ROI:</span>
                          <div className="font-medium text-success-600">$22,000/year</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Timeline:</span>
                          <div className="font-medium text-gray-900">2-3 weeks</div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Card>
                </div>
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div>
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Meetings</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Progress Review</p>
                      <p className="text-xs text-gray-600">Tomorrow, 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Final Demo</p>
                      <p className="text-xs text-gray-600">Feb 20, 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Projects</h2>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm">
                    New Project
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project._id} className="p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('-', ' ')}
                          </Badge>
                          {project.health && (
                            <Badge className={getHealthColor(project.health)}>
                              {project.health}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{project.description || 'No description available'}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Budget</p>
                            <p className="font-medium">${project.budget.allocated.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Spent</p>
                            <p className="font-medium">${project.budget.spent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Progress</p>
                            <p className="font-medium">{project.progress}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Due Date</p>
                            <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-6">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Documentation */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Project Documentation</h2>
                <div className="space-y-4">
                  {[
                    { name: 'E-commerce Automation Guide', type: 'PDF', size: '2.4 MB', updated: '2 days ago' },
                    { name: 'Workflow Training Video', type: 'MP4', size: '45.2 MB', updated: '1 week ago' },
                    { name: 'API Integration Manual', type: 'PDF', size: '1.8 MB', updated: '3 days ago' },
                    { name: 'User Training Materials', type: 'ZIP', size: '12.1 MB', updated: '5 days ago' }
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{doc.updated}</p>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Training Resources */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Training & Support</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Play className="w-5 h-5 text-primary-600" />
                      <h3 className="font-medium text-primary-900">Getting Started Tutorial</h3>
                    </div>
                    <p className="text-sm text-primary-700 mb-3">
                      Learn the basics of your new automation workflows
                    </p>
                    <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                      Watch Now
                    </Button>
                  </div>

                  <div className="p-4 bg-success-50 rounded-lg border border-success-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5 text-success-600" />
                      <h3 className="font-medium text-success-900">Team Training Session</h3>
                    </div>
                    <p className="text-sm text-success-700 mb-3">
                      Schedule a live training session for your team
                    </p>
                    <Button size="sm" variant="outline" className="border-success-600 text-success-600">
                      Schedule Session
                    </Button>
                  </div>

                  <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageCircle className="w-5 h-5 text-warning-600" />
                      <h3 className="font-medium text-warning-900">24/7 Support</h3>
                    </div>
                    <p className="text-sm text-warning-700 mb-3">
                      Get help whenever you need it from our support team
                    </p>
                    <Button size="sm" variant="outline" className="border-warning-600 text-warning-600">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};