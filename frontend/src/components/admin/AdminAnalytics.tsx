import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  PieChart,
  Activity,
  Download
} from 'lucide-react';
import { adminApi, AdminAnalytics as AdminAnalyticsType } from '../../services/adminApi';

const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const exportData = async (type: string) => {
    try {
      await adminApi.exportDashboard('json');
      console.log(`Exported ${type} data`);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les analytics avec l'API réelle
      const data = await adminApi.getAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Erreur lors du chargement des analytiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? '↗' : '↘';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des analytiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadAnalytics}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { metrics, chartData, topExperts, systemHealth } = analyticsData;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytiques</h2>
          <p className="text-gray-600">Statistiques et métriques de la plateforme</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 an</option>
          </select>
          
          <button
            onClick={() => exportData('analytics')}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.userGrowth.current.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${getChangeColor(metrics.userGrowth.change)}`}>
              {getChangeIcon(metrics.userGrowth.change)} {Math.abs(metrics.userGrowth.change)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs période précédente</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.revenue.current.toLocaleString()}€</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${getChangeColor(metrics.revenue.change)}`}>
              {getChangeIcon(metrics.revenue.change)} {Math.abs(metrics.revenue.change)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs période précédente</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projets actifs</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.projects.current}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${getChangeColor(metrics.projects.change)}`}>
              {getChangeIcon(metrics.projects.change)} {Math.abs(metrics.projects.change)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs période précédente</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.satisfaction.current}/5</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${getChangeColor(metrics.satisfaction.change)}`}>
              {getChangeIcon(metrics.satisfaction.change)} {Math.abs(metrics.satisfaction.change)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs période précédente</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Registration Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Inscriptions d'utilisateurs</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Graphique des inscriptions</p>
              <p className="text-sm text-gray-500">(Intégration Chart.js à implémenter)</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Évolution des revenus</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Graphique des revenus</p>
              <p className="text-sm text-gray-500">(Intégration Chart.js à implémenter)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Projets par catégorie</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {chartData.projectsByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' :
                    index === 3 ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-sm text-gray-900">{item.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  <span className="text-sm text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Experts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Top experts</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topExperts.map((expert) => (
              <div key={expert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {expert.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expert.name}</p>
                    <p className="text-xs text-gray-500">{expert.projects} projets • ⭐ {expert.rating}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{expert.revenue.toLocaleString()}€</p>
                  <p className="text-xs text-gray-500">Revenus générés</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">État du système</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
              systemHealth.server === 'healthy' ? 'bg-green-100' : 
              systemHealth.server === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Activity className={`h-8 w-8 ${
                systemHealth.server === 'healthy' ? 'text-green-600' : 
                systemHealth.server === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <p className="text-sm font-medium text-gray-900">Serveur</p>
            <p className={`text-xs ${
              systemHealth.server === 'healthy' ? 'text-green-600' : 
              systemHealth.server === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {systemHealth.server === 'healthy' ? 'Opérationnel' : 
               systemHealth.server === 'warning' ? 'Attention' : 'Critique'}
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
              systemHealth.database === 'healthy' ? 'bg-green-100' : 
              systemHealth.database === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Activity className={`h-8 w-8 ${
                systemHealth.database === 'healthy' ? 'text-green-600' : 
                systemHealth.database === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <p className="text-sm font-medium text-gray-900">Base de données</p>
            <p className={`text-xs ${
              systemHealth.database === 'healthy' ? 'text-green-600' : 
              systemHealth.database === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {systemHealth.database === 'healthy' ? 'Opérationnelle' : 
               systemHealth.database === 'warning' ? 'Attention' : 'Critique'}
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
              systemHealth.api === 'healthy' ? 'bg-green-100' : 
              systemHealth.api === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Activity className={`h-8 w-8 ${
                systemHealth.api === 'healthy' ? 'text-green-600' : 
                systemHealth.api === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <p className="text-sm font-medium text-gray-900">API</p>
            <p className={`text-xs ${
              systemHealth.api === 'healthy' ? 'text-green-600' : 
              systemHealth.api === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {systemHealth.api === 'healthy' ? 'Opérationnelle' : 
               systemHealth.api === 'warning' ? 'Ralentie' : 'Critique'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
