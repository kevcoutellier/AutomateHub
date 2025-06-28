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
  UserX,
  Flag
} from 'lucide-react';
import UserManagement from '../components/admin/UserManagement';
import ProjectModeration from '../components/admin/ProjectModeration';
import SystemSettings from '../components/admin/SystemSettings';
import AdminAnalytics from '../components/admin/AdminAnalytics';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'projects' | 'analytics' | 'settings'>('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    pendingReports: 0,
    systemHealth: 'good'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      setStats({
        totalUsers: 1247,
        activeProjects: 89,
        pendingReports: 3,
        systemHealth: 'good'
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'projects', label: 'Projets', icon: Shield },
    { id: 'analytics', label: 'Analytiques', icon: TrendingUp },
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
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  stats.systemHealth === 'good' ? 'bg-green-500' :
                  stats.systemHealth === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  Système {stats.systemHealth === 'good' ? 'opérationnel' : 'en maintenance'}
                </span>
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
                  <dd className="text-sm font-medium text-gray-900">{stats.totalUsers}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Projets actifs</dt>
                  <dd className="text-sm font-medium text-gray-900">{stats.activeProjects}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Signalements</dt>
                  <dd className="text-sm font-medium text-red-600">{stats.pendingReports}</dd>
                </div>
              </dl>
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
                          <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                          <div className="text-sm text-gray-600">Utilisateurs inscrits</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-gray-900">{stats.activeProjects}</div>
                          <div className="text-sm text-gray-600">Projets actifs</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-6">
                      <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-gray-900">{stats.pendingReports}</div>
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
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <UserCheck className="h-5 w-5 text-green-500 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Nouvel expert vérifié</div>
                            <div className="text-sm text-gray-600">Marie Dubois - Développement Web</div>
                          </div>
                          <div className="text-sm text-gray-500">Il y a 2h</div>
                        </div>
                        
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <Flag className="h-5 w-5 text-red-500 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Nouveau signalement</div>
                            <div className="text-sm text-gray-600">Projet #1234 - Comportement inapproprié</div>
                          </div>
                          <div className="text-sm text-gray-500">Il y a 4h</div>
                        </div>
                        
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-500 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Maintenance programmée</div>
                            <div className="text-sm text-gray-600">Mise à jour système prévue demain à 2h</div>
                          </div>
                          <div className="text-sm text-gray-500">Il y a 6h</div>
                        </div>
                      </div>
                    </div>

                    {/* Pending Actions */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Actions requises</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">3 signalements en attente</div>
                              <div className="text-sm text-gray-600">Nécessitent une modération</div>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                            Examiner
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center">
                            <UserCheck className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">5 experts en attente de vérification</div>
                              <div className="text-sm text-gray-600">Profils à valider</div>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Vérifier
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
