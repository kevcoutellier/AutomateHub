import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  MessageCircle, 
  Calendar, 
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
  Play,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  TrendingDown,
  Eye,
  Filter,
  RefreshCw,
  PlusCircle,
  Activity
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { projectApi, Project, ProjectStats } from '../../services/projectApi';

// Types pour les nouvelles fonctionnalités
interface AIRecommendation {
  id: string;
  type: 'optimization' | 'new_project' | 'expert_match' | 'cost_saving';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedSavings?: number;
  actionUrl?: string;
}

interface SmartNotification {
  id: string;
  type: 'milestone' | 'budget' | 'deadline' | 'opportunity';
  title: string;
  message: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  timestamp: string;
  read: boolean;
}

export const ClientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [projectsData, statsData] = await Promise.all([
        projectApi.getClientProjects(),
        projectApi.getProjectStats()
      ]);
      
      setProjects(projectsData || []);
      setProjectStats(statsData || {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalInvestment: 0,
        totalROI: 0,
        averageProgress: 0
      });
      
      // Charger les recommandations IA et notifications
      await Promise.all([
        loadAIRecommendations(),
        loadSmartNotifications()
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setProjects([]);
      setProjectStats({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalInvestment: 0,
        totalROI: 0,
        averageProgress: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    // Simuler des recommandations IA basées sur les données du client
    const mockRecommendations: AIRecommendation[] = [
      {
        id: '1',
        type: 'optimization',
        title: 'Optimiser le workflow E-commerce',
        description: 'Automatiser le processus de commande pourrait réduire le temps de traitement de 40%',
        impact: 'high',
        estimatedSavings: 2500,
        actionUrl: '/experts?category=ecommerce'
      },
      {
        id: '2',
        type: 'cost_saving',
        title: 'Réduire les coûts opérationnels',
        description: 'Intégrer un chatbot IA pourrait économiser 30h/semaine de support client',
        impact: 'medium',
        estimatedSavings: 1800,
        actionUrl: '/experts?category=chatbot'
      },
      {
        id: '3',
        type: 'expert_match',
        title: 'Expert recommandé disponible',
        description: 'Un expert spécialisé en automatisation CRM est maintenant disponible',
        impact: 'medium',
        actionUrl: '/experts/expert-123'
      }
    ];
    setRecommendations(mockRecommendations);
  };

  const loadSmartNotifications = async () => {
    // Simuler des notifications intelligentes
    const mockNotifications: SmartNotification[] = [
      {
        id: '1',
        type: 'milestone',
        title: 'Jalon atteint',
        message: 'Le projet E-commerce a atteint 75% de completion',
        priority: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'budget',
        title: 'Budget optimisé',
        message: 'Économies de 15% détectées sur le projet CRM',
        priority: 'high',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'Nouvelle opportunité',
        message: 'Possibilité d\'extension du projet actuel détectée',
        priority: 'medium',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ];
    setNotifications(mockNotifications);
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const dismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
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

  // Remove error state display - show empty dashboard instead

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
              <Button 
                variant="outline" 
                onClick={refreshDashboard}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" className="flex items-center gap-2 relative">
                <Bell className="w-4 h-4" />
                <span>{notifications.filter(n => !n.read).length}</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </Button>
              <Button className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                New Project
              </Button>
            </div>
          </div>

          {/* Recommandations IA */}
          {showRecommendations && recommendations.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">AI Recommendations</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowRecommendations(false)}
                >
                  Hide
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="p-4 border-l-4 border-l-primary-500">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-primary-600" />
                        <Badge 
                          className={`text-xs ${
                            rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                            rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          {rec.impact} impact
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => dismissRecommendation(rec.id)}
                      >
                        ×
                      </Button>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    {rec.estimatedSavings && (
                      <div className="flex items-center gap-1 mb-3">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          ${rec.estimatedSavings}/month savings
                        </span>
                      </div>
                    )}
                    <Button size="sm" className="w-full">
                      Take Action
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Notifications intelligentes */}
          {notifications.filter(n => !n.read).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
                Smart Notifications
              </h2>
              <div className="space-y-3">
                {notifications.filter(n => !n.read).slice(0, 3).map((notif) => (
                  <Card key={notif.id} className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          notif.priority === 'urgent' ? 'bg-red-100' :
                          notif.priority === 'high' ? 'bg-orange-100' :
                          notif.priority === 'medium' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          {notif.type === 'milestone' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {notif.type === 'budget' && <DollarSign className="w-4 h-4 text-green-600" />}
                          {notif.type === 'deadline' && <Clock className="w-4 h-4 text-orange-600" />}
                          {notif.type === 'opportunity' && <Star className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{notif.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notif.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markNotificationAsRead(notif.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

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

          {/* Métriques Avancées */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Performance Dashboard */}
            <Card className="p-6 col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {Math.round((projectStats?.completedProjects || 0) / (projectStats?.totalProjects || 1) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">
                    ${Math.round((totalROI / (projectStats?.totalProjects || 1)))}
                  </div>
                  <div className="text-sm text-gray-600">Avg ROI/Project</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">
                    {Math.round(avgProgress / (projectStats?.activeProjects || 1))}%
                  </div>
                  <div className="text-sm text-gray-600">Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info-600">
                    {projectStats?.activeProjects || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Now</div>
                </div>
              </div>

              {/* Graphique de progression simulé */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">E-commerce Automation</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">CRM Integration</span>
                  <span className="font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-warning-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Workflow Optimization</span>
                  <span className="font-medium">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-success-600 h-2 rounded-full" style={{width: '95%'}}></div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full flex items-center justify-start gap-3 h-12">
                  <PlusCircle className="w-5 h-5" />
                  Start New Project
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-start gap-3 h-12">
                  <MessageCircle className="w-5 h-5" />
                  Message Expert
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-start gap-3 h-12">
                  <BarChart3 className="w-5 h-5" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-start gap-3 h-12">
                  <FileText className="w-5 h-5" />
                  Download Reports
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Pro Tip</span>
                </div>
                <p className="text-sm text-blue-700">
                  Review your project milestones weekly to stay on track and maximize ROI.
                </p>
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
                {projects.length > 0 ? (
                  projects.slice(0, 3).map((project, index) => (
                    <div key={project._id} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Due {new Date(project.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          {project.health && (
                            <Badge className={getHealthColor(project.health)}>
                              {project.health}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Projects</h3>
                    <p className="text-gray-600 mb-4">Start your automation journey by creating your first project</p>
                    <Button className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Find Expert
                    </Button>
                  </div>
                )}
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