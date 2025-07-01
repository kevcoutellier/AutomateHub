import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  UserCheck,
  Flag,
  Activity,
  Server,
  Database,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import UserManagement from '../components/admin/UserManagement';
import ProjectModeration from '../components/admin/ProjectModeration';
import SystemSettings from '../components/admin/SystemSettings';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminDashboardEnhanced from '../components/admin/AdminDashboardEnhanced';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import adminApi, { AdminStats } from '../services/adminApi';

const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'advanced' | 'users' | 'projects' | 'analytics' | 'settings'>('dashboard');
  const [adminData, setAdminData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    server: 'healthy',
    storage: 'healthy'
  });
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    loadAdminData();
    loadSystemHealth();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      setAdminData(data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const health = await adminApi.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Error loading system health:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await adminApi.refreshDashboard();
      await Promise.all([loadAdminData(), loadSystemHealth()]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      await adminApi.exportDashboard('json');
    } catch (error) {
      console.error('Error exporting dashboard:', error);
    }
  };

  const handleQuickAction = async (action: any) => {
    try {
      switch (action.type) {
        case 'report_moderation':
          // Navigate to reports tab
          setActiveTab('projects'); // Using projects tab for now
          break;
        case 'expert_verification':
          // Navigate to users tab
          setActiveTab('users');
          break;
        case 'user_management':
          // Navigate to users tab
          setActiveTab('users');
          break;
        default:
          console.log('Action not implemented:', action.type);
      }
    } catch (error) {
      console.error('Error handling quick action:', error);
    }
  };

  const getSystemHealthStatus = () => {
    const healthValues = Object.values(systemHealth);
    if (healthValues.every(status => status === 'healthy')) return 'healthy';
    if (healthValues.some(status => status === 'critical')) return 'critical';
    return 'warning';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours === 1) return 'Il y a 1 heure';
    return `Il y a ${diffInHours}h`;
  };

  const tabs = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'advanced', label: 'Tableau avancé', icon: TrendingUp },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'projects', label: 'Projets', icon: Shield },
    { id: 'analytics', label: 'Analytiques', icon: Activity },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
                <p className="text-gray-600">Gestion et modération de la plateforme</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    getSystemHealthStatus() === 'healthy' ? 'bg-green-500' :
                    getSystemHealthStatus() === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    Système {getSystemHealthStatus() === 'healthy' ? 'opérationnel' : 'en maintenance'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleExport}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </button>
                  <button 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Actualisation...' : 'Actualiser'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 mr-3 ${
                    activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'
                  }`} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques rapides</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Utilisateurs totaux</dt>
                  <dd className="text-sm font-medium text-gray-900">{adminData?.totalUsers || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Projets actifs</dt>
                  <dd className="text-sm font-medium text-gray-900">{adminData?.activeProjects || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Signalements</dt>
                  <dd className="text-sm font-medium text-red-600">{adminData?.pendingReports || 0}</dd>
                </div>
              </dl>
            </div>

            {/* System Health */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">État du système</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Base de données</span>
                  </div>
                  <div className={`flex items-center ${
                    systemHealth.database === 'healthy' ? 'text-green-600' :
                    systemHealth.database === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      systemHealth.database === 'healthy' ? 'bg-green-500' :
                      systemHealth.database === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{systemHealth.database}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Serveur</span>
                  </div>
                  <div className={`flex items-center ${
                    systemHealth.server === 'healthy' ? 'text-green-600' :
                    systemHealth.server === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      systemHealth.server === 'healthy' ? 'bg-green-500' :
                      systemHealth.server === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{systemHealth.server}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Stockage</span>
                  </div>
                  <div className={`flex items-center ${
                    systemHealth.storage === 'healthy' ? 'text-green-600' :
                    systemHealth.storage === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      systemHealth.storage === 'healthy' ? 'bg-green-500' :
                      systemHealth.storage === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{systemHealth.storage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {activeTab === 'dashboard' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord administrateur</h2>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-gray-900">{adminData?.totalUsers || 0}</div>
                          <div className="text-sm text-gray-600">Utilisateurs inscrits</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-gray-900">{adminData?.activeProjects || 0}</div>
                          <div className="text-sm text-gray-600">Projets actifs</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-gray-900">{adminData?.pendingReports || 0}</div>
                          <div className="text-sm text-gray-600">Signalements en attente</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
                      <div className="space-y-3">
                        {adminData?.recentActivity?.map((activity) => {
                          const getActivityIcon = (type: string) => {
                            switch (type) {
                              case 'expert_verification':
                                return <UserCheck className="h-5 w-5 text-green-500 mr-3" />;
                              case 'report_submitted':
                                return <Flag className="h-5 w-5 text-red-500 mr-3" />;
                              case 'system_maintenance':
                                return <Clock className="h-5 w-5 text-blue-500 mr-3" />;
                              case 'user_registration':
                                return <Users className="h-5 w-5 text-blue-500 mr-3" />;
                              default:
                                return <Activity className="h-5 w-5 text-gray-500 mr-3" />;
                            }
                          };

                          return (
                            <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                              {getActivityIcon(activity.type)}
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{activity.title}</div>
                                <div className="text-sm text-gray-600">{activity.description}</div>
                              </div>
                              <div className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</div>
                            </div>
                          );
                        }) || (
                          <div className="text-center py-8 text-gray-500">
                            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Aucune activité récente</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pending Actions */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Actions requises</h3>
                      <div className="space-y-3">
                        {adminData?.pendingActions?.map((action) => {
                          const getPriorityColor = (priority: string) => {
                            switch (priority) {
                              case 'urgent':
                                return 'bg-red-50 border-red-200 text-red-600';
                              case 'high':
                                return 'bg-yellow-50 border-yellow-200 text-yellow-600';
                              case 'medium':
                                return 'bg-blue-50 border-blue-200 text-blue-600';
                              default:
                                return 'bg-gray-50 border-gray-200 text-gray-600';
                            }
                          };

                          const getActionIcon = (type: string) => {
                            switch (type) {
                              case 'report_moderation':
                                return <AlertTriangle className="h-5 w-5 mr-3" />;
                              case 'expert_verification':
                                return <UserCheck className="h-5 w-5 mr-3" />;
                              case 'system_update':
                                return <Download className="h-5 w-5 mr-3" />;
                              default:
                                return <Eye className="h-5 w-5 mr-3" />;
                            }
                          };

                          const getButtonColor = (priority: string) => {
                            switch (priority) {
                              case 'urgent':
                                return 'bg-red-600 hover:bg-red-700';
                              case 'high':
                                return 'bg-yellow-600 hover:bg-yellow-700';
                              case 'medium':
                                return 'bg-blue-600 hover:bg-blue-700';
                              default:
                                return 'bg-gray-600 hover:bg-gray-700';
                            }
                          };

                          return (
                            <div key={action.id} className={`flex items-center justify-between p-4 rounded-lg border ${getPriorityColor(action.priority)}`}>
                              <div className="flex items-center">
                                <div className={getPriorityColor(action.priority).split(' ')[2]}>
                                  {getActionIcon(action.type)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{action.title}</div>
                                  <div className="text-sm text-gray-600">{action.description}</div>
                                  {action.count > 1 && (
                                    <div className="text-xs text-gray-500 mt-1">{action.count} éléments</div>
                                  )}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleQuickAction(action)}
                                className={`px-3 py-1 text-white rounded-md transition-colors ${getButtonColor(action.priority)}`}
                              >
                                Traiter
                              </button>
                            </div>
                          );
                        }) || (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                            <p>Aucune action requise</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && <AdminDashboardEnhanced />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'projects' && <ProjectModeration />}
              {activeTab === 'analytics' && <AdminAnalytics />}
              {activeTab === 'settings' && <SystemSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
