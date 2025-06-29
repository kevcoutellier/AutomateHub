import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Star, 
  Clock, 
  Users,
  Calendar,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface PerformanceMetrics {
  totalEarnings: number;
  monthlyEarnings: number;
  earningsGrowth: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number;
  completionRate: number;
  activeProjects: number;
  completedProjects: number;
  clientRetention: number;
}

interface ProjectStats {
  month: string;
  earnings: number;
  projects: number;
  rating: number;
}

const ExpertPerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    earningsGrowth: 0,
    averageRating: 0,
    totalReviews: 0,
    responseTime: 0,
    completionRate: 0,
    activeProjects: 0,
    completedProjects: 0,
    clientRetention: 0
  });
  const [chartData, setChartData] = useState<ProjectStats[]>([]);
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('6m');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const [metricsResponse, chartResponse] = await Promise.all([
        apiClient.get('/experts/me/performance'),
        apiClient.get(`/experts/me/performance/chart?range=${timeRange}`)
      ]);

      setMetrics(metricsResponse.data.metrics || {});
      setChartData(chartResponse.data.chartData || []);
    } catch (error) {
      console.error('Error loading performance data:', error);
      // Mock data for development
      setMetrics({
        totalEarnings: 45000,
        monthlyEarnings: 7500,
        earningsGrowth: 12.5,
        averageRating: 4.8,
        totalReviews: 127,
        responseTime: 2.3,
        completionRate: 94,
        activeProjects: 5,
        completedProjects: 23,
        clientRetention: 89
      });

      setChartData([
        { month: 'Jan', earnings: 6200, projects: 3, rating: 4.7 },
        { month: 'Fév', earnings: 7800, projects: 4, rating: 4.8 },
        { month: 'Mar', earnings: 5400, projects: 2, rating: 4.9 },
        { month: 'Avr', earnings: 8200, projects: 5, rating: 4.8 },
        { month: 'Mai', earnings: 9100, projects: 4, rating: 4.9 },
        { month: 'Juin', earnings: 7500, projects: 3, rating: 4.8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const maxEarnings = Math.max(...chartData.map(d => d.earnings));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tableau de Performance</h2>
        <div className="flex space-x-2">
          {[
            { key: '3m', label: '3 mois' },
            { key: '6m', label: '6 mois' },
            { key: '1y', label: '1 an' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key as any)}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === key
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalEarnings.toLocaleString()}€
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getGrowthIcon(metrics.earningsGrowth)}
            <span className={`ml-2 text-sm ${getGrowthColor(metrics.earningsGrowth)}`}>
              {metrics.earningsGrowth > 0 ? '+' : ''}{metrics.earningsGrowth}% ce mois
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">{metrics.averageRating}</p>
                <div className="flex">
                  {getRatingStars(metrics.averageRating)}
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {metrics.totalReviews} avis clients
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Temps de réponse</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.responseTime}h</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">Temps moyen de première réponse</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.completionRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">Projets terminés avec succès</span>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Évolution des revenus</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {chartData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 w-8">{data.month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${(data.earnings / maxEarnings) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {data.earnings.toLocaleString()}€
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.projects} projet{data.projects > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Indicateurs de performance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Projets actifs</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{metrics.activeProjects}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Projets terminés</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{metrics.completedProjects}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Rétention client</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{metrics.clientRetention}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Revenus ce mois</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {metrics.monthlyEarnings.toLocaleString()}€
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conseils pour améliorer vos performances</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Réduisez votre temps de réponse</h4>
              <p className="text-sm text-gray-600">
                Répondez aux messages clients en moins de 2h pour améliorer votre note
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Demandez des avis</h4>
              <p className="text-sm text-gray-600">
                Sollicitez activement les retours de vos clients satisfaits
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Finalisez vos projets</h4>
              <p className="text-sm text-gray-600">
                Un taux de réussite élevé attire plus de clients
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Fidélisez vos clients</h4>
              <p className="text-sm text-gray-600">
                Maintenez le contact après la livraison pour de futurs projets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertPerformanceDashboard;
